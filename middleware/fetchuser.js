var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

fetchuser = (req, res, next) => {
    // Get the user from the jwt tocken and id to obj request
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Pleaser authenticate using a valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
}
module.exports = fetchuser;