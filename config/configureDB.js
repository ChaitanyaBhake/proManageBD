const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

//Function for DB
const connectDB = async () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectDB;
