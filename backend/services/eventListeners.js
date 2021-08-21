// Notice: The same event may trigger multiple times in some situations
//         and the listeners may not wait for previous one
//         So don't use this code in production
//         I suggest you use transaction and the higtest isolation level

const {Proposal} = require('../model/Proposals');
// TODO: need to import a notifier(text/email/push notification) used to notify user for each type of events


// I used 'TO' to split the name, you can chose other delimiter
// It would be save to use only lowercase for orgnization names
const PROPOSAL_EVENTS = ['Org1MSPTOOrg2MSP', 'Org2MSPTOOrg1MSP'];

const EVENT_TYPE = {
    PROPOSAL_INIT: 'proposal_init',
    PROPOSAL_ACCEPTED: 'proposal_accepted',
    PAYMENT_ADDED: 'payment_added',
    REPORT_ADDED: 'report_added'
}

const eventListener = async (event) => {
    const eventName = event.eventName;
    if (PROPOSAL_EVENTS.includes(eventName)) {
        
        const details = event.payload;
        const {eventType} = details;
        // call all event handlers
        proposalInitHandler(eventName, eventType, details);
        proposalAcceptHandler(eventName, eventType, details);
        paymentAddedHandler(eventName, eventType, details);
        reportAddedHandler(eventName, eventType, details);

        // notify user here

    }
};


/*
** store all proposal event this orgnization involved to the database
*/
async function proposalInitHandler(eventName, eventType, details){
    if(eventType === EVENT_TYPE.PROPOSAL_INIT){
        const [sender, receiver] = eventName.split('TO');
        const {proposalId} = details;

        // check if this proposal already exists
        const countResult = await Proposal.countDocuments({proposalId}, { limit: 1 });
        if(countResult){
            // the proposal already in database, then do nothing.
            return;
        }
        // store event
        await Proposal.create({
            proposalId,
            eventName,
            eventType,
            sender,
            receiver
        });
    }
    
}

/*
** update stored proposal event this orgnization involved to the database
*/
async function proposalAcceptHandler(eventName, eventType, details){
    if(eventType === EVENT_TYPE.PROPOSAL_ACCEPTED){
        const [sender, receiver] = eventName.split('TO');
        const {proposalId} = details;

        // check if this proposal exists
        const proposal = await Proposal.findOne({proposalId});
        if(!proposal){
            console.log(`Proposal[${proposalId}] not found when accept proposal`);
            return;
        }
        // check if this has not been proposal updated
        if(proposal.eventType === EVENT_TYPE.PROPOSAL_INIT){
            // update proposal
            await Proposal.updateOne({proposalId},
                {$set: {eventType}}
            );
        }
    }
}


// TODO:
async function paymentAddedHandler(eventName, eventType, details){
    if(eventType === EVENT_TYPE.PAYMENT_ADDED){
        const [sender, receiver] = eventName.split('TO');
    }

}
async function reportAddedHandler(eventName, eventType, details){
    if(eventType === EVENT_TYPE.REPORT_ADDED){
        const [sender, receiver] = eventName.split('TO');
    }

}


module.exports = {
    eventListener
}