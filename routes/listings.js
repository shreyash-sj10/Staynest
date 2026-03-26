const express = require("express");
const multer = require("multer");

const router = express.Router();
const listingsController = require("../controllers/listings");
const { storage } = require("../config/cloudinary");
const {
  validateListing,
  isLoggedIn,
  isListingOwner,
} = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingsController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsController.createListing)
  );

router.get("/new", isLoggedIn, wrapAsync(listingsController.renderNewForm));

router
  .route("/:id")
  .get(wrapAsync(listingsController.showListing))
  .put(
    isLoggedIn,
    isListingOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsController.updateListing)
  )
  .delete(isLoggedIn, isListingOwner, wrapAsync(listingsController.deleteListing));

router.get(
  "/:id/edit",
  isLoggedIn,
  isListingOwner,
  wrapAsync(listingsController.renderEditForm)
);

module.exports = router;
