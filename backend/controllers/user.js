const User = require('../model/User');
const {signToken, comparePassword} = require('../services/auth');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

/* sign in to get access token */
const signIn = async (req, res) => {
    const {username, password} = req.body;
    User.findOne({username}, (err, document) => {
        if(err || !document){
            console.log("Failed to find user when sign in", err);
            res.status(401).json({message:"Username or password incorrect."});
        }else{
            const storedHashedPassword = document.password;
            if(comparePassword(password,storedHashedPassword)){
                const accessToken = signToken(document.userId, document.role);
                res.status(200).json({accessToken, userId: document.userId});
            }else{
                res.status(401).json({message:"Username or password incorrect."});
            }

        }
    });
}


const signUp = async (req, res) => {
    try{
        const {username, password, userId} = req.body;
        const {role} = req;
        if(role!=='admin'){
            console.log("Only company admin can register new user");
            return res.status(401).json({message: "Not admin."});
        }

        const document = await User.findOne({ $or:[ {username}, {userId} ]});
        if(document){
            console.log("User already exists.");
            return res.status(401).json({message:"Username already exists."});
        }
        var hash = bcrypt.hashSync(password, salt);
        await User.create({ 
            userId,
            username, 
            password: hash,
            role: "user"
        });
        return res.status(200).json({message: "success."});
    }catch(error){
        console.log(error);
        return res.status(500).json({message: error});
    }
}




module.exports = {
    signIn,
    signUp
};