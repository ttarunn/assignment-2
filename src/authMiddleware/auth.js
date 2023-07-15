const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();

const auth = (req, res, next) => {
    // console.log("auth", req.headers)
    try {
        const token = req.headers.authorization;
        const verifiedToken = jwt.verify(token, process.env.JWT_PASSWORD);
        req.jwt_token = verifiedToken
        next();
    } catch (error) {
        res.status(403).json({
            status: "Error Occured"
        })
    }
}


module.exports = auth;