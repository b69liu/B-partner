/* 
** This proposal model is an expedient to hand 2 problems
** The proposal details are in private collection.
** problem 1: There are to many private collections and it is hard search them one by one,
**            So I could record all proposal id and private collection name, and serach them when need
** problem 2: This proposal model can help to record whether user has read the event notification
*/

const mongoose = require('mongoose');

// eventName is the private collection name
const proposalSchema = new mongoose.Schema({
    proposalId: String,
    eventName: String,
    eventType: String,
    sender: String,
    receiver: String,
    read: Boolean         // should be set false when new event comes, and set true when read

});

const Proposal = mongoose.model('Proposal', proposalSchema, 'Proposals');
module.exports = Proposal;