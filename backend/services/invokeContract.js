/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const { Gateway, Wallets, DefaultEventHandlerStrategies } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const {eventListener} = require('./eventListeners');


let gateway = null;
let contract = null;
async function connect(){
    // load the network configuration
    const ccpPath = path.resolve(__dirname, 'connection-org1.json');
    let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.resolve(__dirname, 'wallet');                      // THIS WALLET IS FOR TESTING ONLY
    const wallet = await Wallets.newFileSystemWallet(walletPath);              // DO NOT PUT YOUR REAL ONE TO GITHUB

    // for event listener
    const connectOptions = {
        eventHandlerOptions: {
            strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX
        },
        wallet, 
        identity: 'appUser', 
        discovery: { enabled: true, asLocalhost: true } 
    }
    gateway = new Gateway();
    await gateway.connect(ccp, connectOptions);
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');
    // Get the contract from the network.
    contract = network.getContract('bpartner');
    // disconnect when exit
    process.on("exit",async ()=>{
        console.log("disconnecting...");
        await gateway.disconnect();
    });
    return contract;
}



// helper function to send any query to the chaincode
async function query(method, ...paramters) {
    try {
        const result = await contract.evaluateTransaction(method, ...paramters);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        // await gateway.disconnect();
        return result.toString();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return '';
    }
}

// helper function to send any invoke to the chaincode
async function invoke(method, ...paramters) {
    try {
        await contract.submitTransaction(method, ...paramters);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        // await gateway.disconnect();
        return true;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return false;
    }
}


/*
**  not expose the the common helper function directly to the next layer
**  to keep the reference and signature, as well as to limit the access
*/

// queries
async function queryTeam(teamId) {
    const result = await query("queryTeam",teamId);
    return result;
}
async function queryAllTeams() {
    const result = await query("queryAllTeams");
    return result;
}
async function queryProposals(privateCollectionName) {
    const result = await query("queryProposals", privateCollectionName);
    return result;
}

// invokes
async function createTeam(teamId, status, teamType, teamMembers) {
    return invoke("createTeam", teamId, status, teamType, teamMembers);
}
async function addMember(teamId, memberId, memberName, role) {
    return invoke("addMember", teamId, memberId, memberName, role);
}
async function editMember(teamId, memberId, memberName, role) {
    return invoke("editMember", teamId, memberId, memberName, role);
}
async function removeMember(teamId, memberId) {
    return invoke("removeMember", teamId, memberId);
}
async function updateTeam(teamId, status, teamType) {
    return invoke("updateTeam", teamId, status, teamType);
}
async function removeTeam(teamId) {
    return invoke("removeTeam", teamId);
}
async function sendProposal(teamId, content, agreement) {
    return invoke("sendProposal", teamId, content, agreement);
}
async function acceptProposal(fromOrgnization, proposalId) {
    return invoke("acceptProposal", fromOrgnization, proposalId);
}
async function sendPaymentRecord(proposalId, toOrgnization ,paymentAmount, paymentProof) {
    return invoke("sendPaymentRecord", proposalId, toOrgnization ,paymentAmount, paymentProof);
}
async function sendTaskResultReport(proposalId, fromOrgnization,resultReport) {
    return invoke("sendTaskResultReport", proposalId, fromOrgnization,resultReport);
}


async function starteventListener(){
    process.on('exit', async()=>{
        // Disconnect from the gateway.
        await gateway.disconnect();
    });
    return contract.addContractListener(eventListener);
}

async function initBlockchainConnection(){
    await connect();
    await starteventListener();
}

module.exports = {
    initBlockchainConnection,
    queryTeam,
    queryAllTeams,
    queryProposals,
    createTeam,
    addMember,
    editMember,
    removeMember,
    updateTeam,
    removeTeam,
    sendProposal,
    acceptProposal,
    sendPaymentRecord,
    sendTaskResultReport
}
