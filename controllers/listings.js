const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../config/cloudinary");
const { DEFAULT_LISTING_IMAGE } = require("../config/constants");

function buildListingData(body) {
  const { title, description, price, location, country } = body;

  return {
    title,
    description,
    price,
    location,
    country,
  };
}

async function findListingOrThrow(id) {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  return listing;
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({}).populate("owner");
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(buildListingData(req.body));
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();
  req.flash("success", "Successfully made a new listing");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const myListings = await findListingOrThrow(req.params.id);
  res.render("listings/edit.ejs", { myListings });
};

module.exports.showListing = async (req, res) => {
  const myListings = await Listing.findById(req.params.id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });

  if (!myListings) {
    throw new ExpressError(404, "Listing not found");
  }

  res.render("listings/show.ejs", { myListings });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, buildListingData(req.body), {
    new: true,
    runValidators: true,
  });

  if (!updatedListing) {
    throw new ExpressError(404, "Listing not found");
  }

  if (req.file) {
    if (
      updatedListing.image &&
      updatedListing.image.filename &&
      updatedListing.image.filename !== DEFAULT_LISTING_IMAGE.filename
    ) {
      await cloudinary.uploader.destroy(updatedListing.image.filename);
    }

    updatedListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

    await updatedListing.save();
  }

  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const deletedListing = await Listing.findByIdAndDelete(req.params.id);

  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found");
  }

  if (
    deletedListing.image &&
    deletedListing.image.filename &&
    deletedListing.image.filename !== DEFAULT_LISTING_IMAGE.filename
  ) {
    await cloudinary.uploader.destroy(deletedListing.image.filename);
  }

  res.redirect("/listings");
};
