var jwt = require('jsonwebtoken');
var bcrypt = require("bcryptjs");

// const SECRET = process.env.SECRET || require('crypto').randomBytes(64).toString('hex');
const SECRET = "PLEASE USE PREVIOUS LINE IN PRODUCTION ENV";


function signToken(userId, role){
    const token = jwt.sign({userId, role},SECRET, { expiresIn: '2592000s' });
    return token;
}



function auth(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.sendStatus(401)

    jwt.verify(token, SECRET, (err, decoded) => {
        console.log(err)

        if (err) return res.sendStatus(403)

        req.userId = decoded.userId;
        req.role = decoded.role;

        next()
    })
}

function comparePassword(passwordString, passwordHash) {
    return bcrypt.compareSync(
        passwordString,
        passwordHash
    );
}

module.exports = {
    signToken,
    comparePassword,
    auth,
}

