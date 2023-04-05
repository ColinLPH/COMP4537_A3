const { mongoose } = require('mongoose')

const connectDB = async (input) => {
  try {
    // connect to the database
    const url = `mongodb://localhost:27017/pokeUsers`;
    const x = await mongoose.connect(url);
    // console.log("Connected to db");
    if (input.drop === true)
      mongoose.connection.db.dropDatabase();
    // console.log("Dropped db");
    // get the data from Github 
  } catch (error) {
    console.log('db error');
  }
}

module.exports = { connectDB }