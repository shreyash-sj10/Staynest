const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review");
const { DEFAULT_LISTING_IMAGE } = require("../config/constants");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      default: DEFAULT_LISTING_IMAGE.url,
    },
    filename: {
      type: String,
      default: DEFAULT_LISTING_IMAGE.filename,
    },
  },
  price: Number,
  location: String,
  country: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("listing", listingSchema);
module.exports = Listing;
