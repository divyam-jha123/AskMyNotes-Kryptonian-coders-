const mongoose = require('mongoose');

const connectDb = (url) => {
    return mongoose
        .connect(url)
        .then(() => {
            console.log("database sucessfully connected...");
            return mongoose.connection;
        });
}

module.exports = connectDb;