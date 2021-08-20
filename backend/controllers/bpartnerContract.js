const User = require('../model/User');
const {
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
    sendTaskResultReport,
} = require('../services/invokeContract');

const queryTeamResolver = async (req, res) => {
    const {userId, role} = req;
    const {teamId} = req.query;
    if( !['admin','user'].includes(role) ){
        return res.status(403).json({message:`Not permitted account role: ${role}`});
    }
    let result = await queryTeam(teamId);
    if(result){
        result = JSON.parse(result);
    }
    return res.status(200).json({data:result});
    
}

const queryAllTeamsResolver = async (req, res) => {
    const {userId, role} = req;
    if( !['admin','user'].includes(role) ){
        return res.status(403).json({message:`Not permitted account role: ${role}`});
    }
    let result = await queryAllTeams();
    if(result){
        result = JSON.parse(result);
    }
    return res.status(200).json({data:result});
    
}

const queryProposalsResolver = async (req, res) => {
    const {userId, role} = req;
    const {privateCollectionName} = req.query;
    if( !['admin','user'].includes(role) ){
        return res.status(403).json({message:`Not permitted account role: ${role}`});
    }
    let result = await queryProposals(privateCollectionName);
    if(result){
        result = JSON.parse(result);
    }
    return res.status(200).json({data:result});

}

const createTeamResolver = async (req, res) => {
    const {userId, role} = req;
    const {teamId, status, teamType, teamMembers} = req.body;
    // only admin(company manager) can create new team
    if(role!=='admin'){
        return res.status(403).json({message:"Not admin account."});
    }
    const result = await createTeam(teamId, status, teamType, teamMembers);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

const addMemberResolver = async (req, res) => {
    const {userId, role} = req;
    const {teamId, memberId, memberName, role} = req.body;
    // only admin(company manager) can change the team member
    if(role!=='admin'){
        return res.status(403).json({message:"Not admin account."});
    }
    const result = await addMember(teamId, memberId, memberName, role);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

const editMemberResolver = async (req, res) => {
    const {userId, role} = req;
    const {teamId, memberId, memberName, role} = req.body;
    // only admin(company manager) can change the team member
    if(role!=='admin'){
        return res.status(403).json({message:"Not admin account."});
    }
    const result = await editMember(teamId, memberId, memberName, role);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

const removeMemberResolver = async (req, res) => {
    const {userId, role} = req;
    const {teamId, memberId} = req.body;
    // only admin(company manager) can remove the team member
    if(role!=='admin'){
        return res.status(403).json({message:"Not admin account."});
    }
    const result = await removeMember(teamId, memberId);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

const updateTeamResolver = async (req, res) => {
    const {userId, role} = req;
    const {teamId, status, teamType} = req.body;
    // only admin(company manager) can remove the team member
    if( !['admin','user'].includes(role) ){
        return res.status(403).json({message:`Not permitted account role: ${role}`});
    }
    const result = await updateTeam(teamId, status, teamType);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

const removeTeamResolver = async (req, res) => {
    const {userId, role} = req;
    const {teamId} = req.body;
    // only admin(company manager) can remove the team
    if(role!=='admin'){
        return res.status(403).json({message:"Not admin account."});
    }
    const result = await removeTeam(teamId);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

const sendProposalResolver = async (req, res) => {
    const {userId, role} = req;
    const {teamId, content, agreement} = req.body;
    // only admin(company manager) can remove the team member
    if( !['admin','user'].includes(role) ){
        return res.status(403).json({message:`Not permitted account role: ${role}`});
    }
    const result = await sendProposal(teamId, content, agreement);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

const acceptProposalResolver = async (req, res) => {
    const {userId, role} = req;
    const {fromOrgnization, proposalId} = req.body;
    // only admin(company manager) can remove the team member
    if( !['admin','user'].includes(role) ){
        return res.status(403).json({message:`Not permitted account role: ${role}`});
    }
    const result = await acceptProposal(fromOrgnization, proposalId);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

// TODO: upload pdf and hash it
const sendPaymentRecordResolver = async (req, res) => {
    const {userId, role} = req;
    const {proposalId, toOrgnization ,paymentAmount, paymentProof} = req.body;
    // only admin(company manager) can remove the team member
    if( !['admin','user'].includes(role) ){
        return res.status(403).json({message:`Not permitted account role: ${role}`});
    }
    const result = await sendPaymentRecord(proposalId, toOrgnization ,paymentAmount, paymentProof);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}

const sendTaskResultReportResolver = async (req, res) => {
    const {userId, role} = req;
    const {proposalId, fromOrgnization,resultReport} = req.body;
    // only admin(company manager) can remove the team member
    if( !['admin','user'].includes(role) ){
        return res.status(403).json({message:`Not permitted account role: ${role}`});
    }
    const result = await sendTaskResultReport(proposalId, fromOrgnization,resultReport);
    if(result){
        return res.status(201).json({message:`success`});
    }else{
        return res.status(500).json({message:`failed`});
    }
}






module.exports = {
    queryTeamResolver,
    queryAllTeamsResolver,
    queryProposalsResolver,
    createTeamResolver,
    addMemberResolver,
    editMemberResolver,
    removeMemberResolver,
    updateTeamResolver,
    removeTeamResolver,
    sendProposalResolver,
    acceptProposalResolver,
    sendPaymentRecordResolver,
    sendTaskResultReportResolver
};