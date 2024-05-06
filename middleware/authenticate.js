const jwt = require("jsonwebtoken");
const admins = require("../models/adminusersSchema")
const keysecret = "shubhanshutiwariindreshguptamumb"


const Authenticate = async (req, res, next) => {
    try {

        const token = req.cookies.jwtoken;
        const verifyToken = jwt.verify(token, keysecret);

        const rootUser = await admins.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootUser) { throw new Error('User not Found') }
        
        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
        
    } catch (err) {
        res.status(401).send('Unauthorized:No token provided');
        console.log(err);
    }
}

module.exports = Authenticate;
