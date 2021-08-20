const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    proposalId: String,
    eventType: String,
    sender: String,
    receiver: String,

});

const Proposal = mongoose.model('Proposal', proposalSchema, 'Proposals');
module.exports = Proposal;