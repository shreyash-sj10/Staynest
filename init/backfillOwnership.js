require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");

async function backfillOwnership() {
  const mongoUri = process.env.DB_URL || "mongodb://127.0.0.1:27017/wonderlust";
  await mongoose.connect(mongoUri);

  const userEmail = process.env.BACKFILL_USER_EMAIL;

  if (!userEmail) {
    throw new Error("BACKFILL_USER_EMAIL is required to run the ownership backfill.");
  }

  const user = await User.findOne({ email: userEmail.toLowerCase() });

  if (!user) {
    throw new Error(`No user found for ${userEmail}.`);
  }

  const listingResult = await Listing.updateMany(
    { owner: { $exists: false } },
    { $set: { owner: user._id } }
  );

  const reviewResult = await Review.updateMany(
    { author: { $exists: false } },
    { $set: { author: user._id } }
  );

  console.log(`Listings updated: ${listingResult.modifiedCount}`);
  console.log(`Reviews updated: ${reviewResult.modifiedCount}`);

  await mongoose.connection.close();
}

backfillOwnership().catch(async (err) => {
  console.error(err.message);
  await mongoose.connection.close();
  process.exit(1);
});
