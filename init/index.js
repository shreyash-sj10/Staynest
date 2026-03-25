require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

async function main() {
  const mongoUri = process.env.DB_URL || "mongodb://127.0.0.1:27017/wonderlust";
  await mongoose.connect(mongoUri);
  console.log("Database connection established");
}
main()
  .then(() => {
    console.log("connection db successful");
  })
  .catch((err) => console.log(err));

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData);
  console.log("Database initialized with sample data");
  await mongoose.connection.close();
};
initDB();
