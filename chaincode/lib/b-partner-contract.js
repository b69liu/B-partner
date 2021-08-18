/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

const STATUS = {
    AVAILABLE: 'available',
    BUSY: 'busy'
}
const PROPOSAL_STATUS = {
    INITIALIZED: 'initial',
    ACCEPTED: 'accepted',
    DONE: 'done'
}
const EVENT_TYPE = {
    PROPOSAL_INIT: 'proposal_init',
    PROPOSAL_ACCEPTED: 'proposal_accepted',
    PAYMENT_ADDED: 'payment_added',
    REPORT_ADDED: 'report_added'
}
class BPartnerContract extends Contract {

    async getMyMSPId(ctx){
        let cid = new ClientIdentity(ctx.stub);
        const organizationId = await cid.getMSPID();
        return organizationId;
    }

    async teamExists(ctx, teamId) {
        const buffer = await ctx.stub.getState(teamId);
        return (!!buffer && buffer.length > 0);
    }

    async createTeam(ctx, teamId, status, teamType, teamMembers) {
        teamId = teamId.toString();
        const organization = await this.getMyMSPId(ctx);
        const exists = await this.teamExists(ctx, teamId);
        if (exists) {
            throw new Error(`The team ${teamId} already exists`);
        }
        if(teamMembers.constructor.name === "String"){
            teamMembers = JSON.parse(teamMembers);
        }
        if(teamMembers.constructor.name !== "Array"){
            teamMembers = []
        }
        // stringify all member id
        teamMembers.forEach(teamMember => {
            teamMember.memberId = teamMember.memberId.toString();
        });
        const asset = { status, teamType, teamMembers, organization };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(teamId, buffer);
        return "Team Created";
    }

    async queryTeam(ctx, teamId) {
        const exists = await this.teamExists(ctx, teamId);
        if (!exists) {
            throw new Error(`The team ${teamId} does not exist`);
        }
        const buffer = await ctx.stub.getState(teamId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async queryAllTeams(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        // loop through all teams
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }



    /**
    **  add a new member to an existing team
    **/
    async addMember(ctx, teamId, memberId, memberName, role) {
        memberId = memberId.toString();
        const myOrganization = await this.getMyMSPId(ctx);
        // read the team
        const teamAsBytes = await ctx.stub.getState(teamId);
        if (!teamAsBytes || teamAsBytes.length === 0) {
            throw new Error(`The team ${teamId} does not exist`);
        }
        const team = JSON.parse(teamAsBytes.toString());
        // verify organization
        if(team.organization !== myOrganization){
            throw new Error(`The team ${teamId} is from other orgnization`);
        }

        const existingMember = team.teamMembers.find(member => member.memberId == memberId );
        if(existingMember){
            throw new Error(`The member ${memberId} already exists in the team ${teamId}`);
        }
        // append a new member to the teamMembers array
        team.teamMembers.push({
            memberId,
            memberName,
            role
        });
        // store the updated team back
        const buffer = Buffer.from(JSON.stringify(team));
        await ctx.stub.putState(teamId, buffer);
        return "Member Added";
    }

    /**
    **  update the information for an existing member in the team
    **/
    async editMember(ctx, teamId, memberId, memberName, role) {
        const myOrganization = await this.getMyMSPId(ctx);
        // read the team
        const teamAsBytes = await ctx.stub.getState(teamId);
        if (!teamAsBytes || teamAsBytes.length === 0) {
            throw new Error(`The team ${teamId} does not exist`);
        }
        const team = JSON.parse(teamAsBytes.toString());
        // verify organization
        if(team.organization !== myOrganization){
            throw new Error(`The team ${teamId} is from other orgnization`);
        }
        // find the index of the member
        let memberIndex = team.teamMembers.findIndex(member => member.memberId === memberId );
        if(memberIndex < 0){
            throw new Error(`The member ${memberId} does not exist in the team ${teamId}`);
        }
        // update the member data
        team.teamMembers[memberIndex] = {...(team.teamMembers[memberIndex]), memberName, role};
        // store the updated team back
        const buffer = Buffer.from(JSON.stringify(team));
        await ctx.stub.putState(teamId, buffer);
        return "Member Updated";
    }

    /**
    **  Remove an existing member in the team
    **/
    async removeMember(ctx, teamId, memberId) {
        const myOrganization = await this.getMyMSPId(ctx);
        // read the team
        const teamAsBytes = await ctx.stub.getState(teamId);
        if (!teamAsBytes || teamAsBytes.length === 0) {
            throw new Error(`The team ${teamId} does not exist`);
        }
        const team = JSON.parse(teamAsBytes.toString());
        // verify organization
        if(team.organization !== myOrganization){
            throw new Error(`The team ${teamId} is from other orgnization`);
        }
        // find the index of the member
        let memberIndex = team.teamMembers.findIndex(member => member.memberId == memberId );
        if(memberIndex < 0){
            throw new Error(`The member ${memberId} does not exist in the team ${teamId}`);
        }
        // remote the the member from the array, side-effect
        team.teamMembers.splice(memberIndex, 1);

        // store the updated team back
        const buffer = Buffer.from(JSON.stringify(team));
        await ctx.stub.putState(teamId, buffer);
        return "Member Removed";
    }

    /**
    **  update an existing team, not including teamMembers
    **/
    async updateTeam(ctx, teamId,  status, teamType) {
        const myOrganization = await this.getMyMSPId(ctx);
        // read the team
        const teamAsBytes = await ctx.stub.getState(teamId);
        if (!teamAsBytes || teamAsBytes.length === 0) {
            throw new Error(`The team ${teamId} does not exist`);
        }
        const team = JSON.parse(teamAsBytes.toString());
        // verify organization
        if(team.organization !== myOrganization){
            throw new Error(`The team ${teamId} is from other orgnization`);
        }
        // update team data
        if(status!=null){
            team.status = status;
        }
        if(teamType!=null){
            team.teamType = teamType;
        }
        // store the updated team back
        const buffer = Buffer.from(JSON.stringify(team));
        await ctx.stub.putState(teamId, buffer);
        return "Team Updated";
    }

    async removeTeam(ctx, teamId) {
        const myOrganization = await this.getMyMSPId(ctx);
        // read the team
        const teamAsBytes = await ctx.stub.getState(teamId);
        if (!teamAsBytes || teamAsBytes.length === 0) {
            throw new Error(`The team ${teamId} does not exist`);
        }
        const team = JSON.parse(teamAsBytes.toString());
        // verify organization
        if(team.organization !== myOrganization){
            throw new Error(`The team ${teamId} is from other orgnization`);
        }
        await ctx.stub.deleteState(teamId);
        return "Team Removed";
    }

    async sendProposal(ctx, teamId, content, agreement) {
        const myOrganization = await this.getMyMSPId(ctx);
        // read the team
        const teamAsBytes = await ctx.stub.getState(teamId);
        if (!teamAsBytes || teamAsBytes.length === 0) {
            throw new Error(`The team ${teamId} does not exist`);
        }
        const team = JSON.parse(teamAsBytes.toString());
        // verify organization
        if(team.organization == myOrganization){
            throw new Error(`The team ${teamId} is from the same orgnization`);
        }
        // verify team status to be availabe
        if(team.status !== STATUS.AVAILABLE){
            throw new Error(`The team ${teamId} is not availabe`);
        }
        const privateCollectionName = myOrganization + "TO" + team.organization;
        const proposalId = "PROPOSAL" + (new Date()).getTime();
        const proposal = {
            proposalId,
            fromOrgnization:myOrganization,
            initDate:new Date(),
            status: PROPOSAL_STATUS.INITIALIZED,
            teamId,
            content,
            agreement,
            payments: [],
            resultReports: []
        }
        await ctx.stub.putPrivateData(privateCollectionName, proposalId, Buffer.from(JSON.stringify(proposal)));
        const eventPayloadBuffer = new Buffer.from(JSON.stringify({
            proposalId,
            teamId,
            eventType: EVENT_TYPE.PROPOSAL_INIT,
        }));
        ctx.stub.setEvent(privateCollectionName, eventPayloadBuffer);
        return "Proposal Sent"
    }

    /**
    **  accept a proposal
    **  the proposal must from another orgnization
    **/
    async acceptProposal(ctx,  fromOrgnization, proposalId) {
        const myOrganization = await this.getMyMSPId(ctx);
        // read the proposal from  private collection
        const privateCollectionName = fromOrgnization + "TO" + myOrganization;
        const buffer = await ctx.stub.getPrivateData(privateCollectionName, proposalId);
        const proposal = JSON.parse(buffer.toString());
        const teamId = proposal.teamId;
        // read the team
        const teamAsBytes = await ctx.stub.getState(teamId);
        if (!teamAsBytes || teamAsBytes.length === 0) {
            throw new Error(`The team ${teamId} does not exist`);
        }
        const team = JSON.parse(teamAsBytes.toString());
        // verify team status to be availabe
        if(team.status != STATUS.AVAILABLE){
            throw new Error(`The team ${teamId} is not availabe`);
        }

        // update proposal
        proposal.status = PROPOSAL_STATUS.ACCEPTED;
        proposal.acceptDate = new Date();
        // update team
        team.status = STATUS.BUSY;


        // store updated proposal back
        await ctx.stub.putPrivateData(privateCollectionName, proposalId, Buffer.from(JSON.stringify(proposal)));
        // store updated team back
        await ctx.stub.putState(teamId, Buffer.from(JSON.stringify(team)));

        // emit event
        const eventPayloadBuffer = new Buffer.from(JSON.stringify({
            proposalId,
            eventType: EVENT_TYPE.PROPOSAL_ACCEPTED,
        }));
        ctx.stub.setEvent(privateCollectionName, eventPayloadBuffer);
        return "Proposal Accepted"
    }

    /**
    **  query all proposals from a data collection
    **/
    async queryProposals(ctx, privateCollectionName) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        // loop through all teams
        for await (const {key, value} of ctx.stub.getPrivateDataByRange(privateCollectionName, startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }

    /**
    **  add a payment report to the proposal
    **  payment can be added multiple times
    **/
    async sendPaymentRecord(ctx, proposalId, toOrgnization ,paymentAmount, paymentProof) {
        const myOrganization = await this.getMyMSPId(ctx);
        // read the proposal from  private collection
        const privateCollectionName = myOrganization + "TO" + toOrgnization;
        const buffer = await ctx.stub.getPrivateData(privateCollectionName, proposalId);
        const proposal = JSON.parse(buffer.toString());
        // add payment to the proposal
        proposal.payments.push({
            paymentAmount,
            paymentProof
        });
        await ctx.stub.putPrivateData(privateCollectionName, proposalId, Buffer.from(JSON.stringify(proposal)));
        // emit event
        const eventPayloadBuffer = new Buffer.from(JSON.stringify({
            proposalId,
            eventType: EVENT_TYPE.PAYMENT_ADDED,
        }));
        ctx.stub.setEvent(privateCollectionName, eventPayloadBuffer);
        return "Report Sent"
    }

    /**
    **  add a result report to the proposal
    **  report can be added multiple times
    **/
    async sendTaskResultReport(ctx, proposalId, fromOrgnization,resultReport) {
        const myOrganization = await this.getMyMSPId(ctx);
        // read the proposal from  private collection
        const privateCollectionName = fromOrgnization + "TO" + myOrganization;
        const buffer = await ctx.stub.getPrivateData(privateCollectionName, proposalId);
        const proposal = JSON.parse(buffer.toString());
        // add result report to the proposal
        proposal.resultReports.push(resultReport);
        proposal.status = PROPOSAL_STATUS.DONE;
        await ctx.stub.putPrivateData(privateCollectionName, proposalId, Buffer.from(JSON.stringify(proposal)));
        // emit event
        const eventPayloadBuffer = new Buffer.from(JSON.stringify({
            proposalId,
            eventType: EVENT_TYPE.PAYMENT_ADDED,
        }));
        ctx.stub.setEvent(privateCollectionName, eventPayloadBuffer);
        return "Payment Sent"
    }

}

module.exports = BPartnerContract;
