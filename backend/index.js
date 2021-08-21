const express = require("express");
const cors = require('cors');
const path = require("path");
const mongoose = require("mongoose");
const {signIn, signUp} = require("./controllers/user");
const {
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
} = require("./controllers/bpartnerContract");
const {initBlockchainConnection} = require("./services/invokeContract");
const {auth} = require("./services/auth");

const DATABASE_URL ="mongodb://appUser:user009@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false";

// wrapped server start code
async function startServer() {
  
  // connect to database
  await mongoose.connect(DATABASE_URL, { useNewUrlParser: true,  useUnifiedTopology: true  }).then(
    () => {
      console.log("Mongoose connected successfully ");
    },
    (error) => {
      console.log("Mongoose could not connect to database: " + error);
    }
  );

  // connect to blockchain
  await initBlockchainConnection();

  // build express server
  const app = express();
  const http = require("http").Server(app);
  app.use(cors());
  //   app.use(express.static(path.join(__dirname, "./staticweb")));  // front end is still under development :</
  app.use(express.json());
  app.all('/private/*', (req, res, next) => auth(req, res, next));
  app.use("/sign_in", signIn);
  app.use("/private/sign_up", signUp);

  // queries
  app.get("/test",(req,res)=>res.status(200).send("success"));
  app.get("/private/queryTeam",queryTeamResolver);
  app.get("/private/queryAllTeams",queryAllTeamsResolver);
  // TODO: add event listener and store proposal data to our databse and query from database. It can be also done in a worker server.
  app.get("/private/queryProposals",queryProposalsResolver);


  // invokes
  app.post("/private/createTeam",createTeamResolver);
  app.post("/private/addMember",addMemberResolver);
  app.post("/private/editMember",editMemberResolver);
  app.post("/private/removeMember",removeMemberResolver);
  app.post("/private/updateTeam",updateTeamResolver);
  app.post("/private/removeTeam",removeTeamResolver);
  app.post("/private/acceptProposal",acceptProposalResolver);

  // unfinished endpoints     additional features needed: validate, receive file, hash file, email or upload to S3 and grant permission?
  app.post("/private/sendProposal",sendProposalResolver);
  app.post("/private/sendPaymentRecord",sendPaymentRecordResolver);
  app.post("/private/sendTaskResultReport",sendTaskResultReportResolver);



  let port = process.env.PORT || "8080";
  http.listen(port, () => {
    console.log(`listen on port: ${port} with the pid: ${process.pid}`);
  });
}

startServer();
