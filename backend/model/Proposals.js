const mongoose = require('mongoose');

// eventName is the private collection name
const proposalSchema = new mongoose.Schema({
    proposalId: String,
    eventName: String,
    eventType: String,
    sender: String,
    receiver: String,

});

const Proposal = mongoose.model('Proposal', proposalSchema, 'Proposals');
module.exports = Proposal;