const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE: 1 create a User using : POST "/api/auth/createUser" ,no login require
router.post('/createuser',
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid mail').isEmail(),
    body('password', 'password must be atleast 5 character').isLength({ min: 5 }),
    async (req, res) => {
        let success = false;
        // if there are errors , returns bad request and bad errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        // check whether the user with this mail exists already 
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ success, error: "sorry the user with this mail is already exists" })
            }
            const salt = await bcrypt.genSalt(10)
            const secPass = await bcrypt.hash(req.body.password, salt);
            // create a new user
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            });
            const data = {
                user: {
                    id: user.id
                }
            }
            const authtocken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtocken })
        }
        // catch error like server me issue aayega tb hogi like user== userde
        catch (error) {
            console.error(error.message);
            res.status(500).send("some error occured");
        }
    })

// ROUTE :2 Authentcate a User using : POST "/api/auth/login" , no login require
router.post('/login', [
    // body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid mail').isEmail(),
    body('password', 'password cannot be blank').exists()],
    async (req, res) => {
        let success = false;
        // if there are errors , returns bad request and bad errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                success = false;
                return res.status(400).json({ error: "please try to login with correct credential" })
            }
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                success = false;
                return res.status(400).json({ success, error: "please try to login with correctr credential" })
            }
            const data = {
                user: {
                    id: user.id
                }
            }
            const authtocken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtocken })
        } catch (error) {
            console.error(error.message);
            res.status(500).send("internal server error");
        }
    })
// ROUTE :3 Get loggedin User detail using : POST "/api/auth/getuser" , login require
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
})
module.exports = router