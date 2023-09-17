const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL

const connectToMongo = () => {
    mongoose.connect(MONGO_URL, () => {
        console.log("connected to mongo successfully");
    })
}

module.exports = connectToMongo;