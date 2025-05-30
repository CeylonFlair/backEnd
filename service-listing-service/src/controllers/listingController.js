import Listing from "../models/Listing.js";
import { buildQuery } from "../utils/buildQuery.js";
import { getUserById } from "../services/userService.js";
import cloudinary from "../config/cloudinary.js";

export const createListing = async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;
    let imageUrls = [];
    let imageUploadWarning = null;

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "listings" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          })
      );

      const uploadResults = await Promise.allSettled(uploadPromises);

      imageUrls = uploadResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value.secure_url);

      uploadResults
        .filter((result) => result.status === "rejected")
        .forEach((result) =>
          console.error("Image upload failed:", result.reason.message)
        );

      if (req.files.length > 0 && imageUrls.length === 0) {
        imageUploadWarning =
          "All image uploads failed. Listing was created without images.";
      }
    }

    const listing = await Listing.create({
      providerId: req.user.id,
      title,
      description,
      price,
      category,
      images: imageUrls,
    });

    res
      .status(201)
      .json(
        imageUploadWarning ? { listing, warning: imageUploadWarning } : listing
      );
  } catch (err) {
    next(err);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Fetch provider details
    const token = req.headers.authorization?.split(" ")[1];
    let provider = null;
    try {
      provider = await getUserById(listing.providerId, token);
    } catch (e) {
      // If user service is down or user not found, log the error but continue
      console.error("Error fetching provider:", e.message);
    }

    res.json({
      ...listing.toObject(),
      provider: provider
        ? {
            name: provider.name,
            profilePicture: provider.profilePicture,
            email: provider.email,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

export const getListingWithProvider = async (req, res, next) => {
  try {
    const providerId = req.params.providerId || req.query.providerId;
    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    // Pagination params
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const total = await Listing.countDocuments({ providerId });

    const listings = await Listing.find({ providerId })
      .skip(skip)
      .limit(limit)
      .sort("-createdAt");

    if (!listings.length) {
      return res
        .status(404)
        .json({ message: "No listings found for this provider" });
    }

    // Fetch provider details
    const token = req.headers.authorization?.split(" ")[1];
    let provider = null;
    try {
      provider = await getUserById(providerId, token);
    } catch (e) {
      console.error("Error fetching provider:", e.message);
    }

    res.json({
      provider: provider
        ? {
            name: provider.name,
            profilePicture: provider.profilePicture,
            email: provider.email,
          }
        : null,
      listings: listings.map((listing) => listing.toObject()),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      providerId: req.user.id,
    });
    if (!listing)
      return res
        .status(404)
        .json({ message: "Listing not found or not authorized" });

    // Option 2: Parse removeImages if it's a stringified array (e.g., from form-data)
    if (typeof req.body.removeImages === "string") {
      try {
        req.body.removeImages = JSON.parse(req.body.removeImages);
      } catch {
        req.body.removeImages = [];
      }
    }

    // Remove specific images if requested
    if (
      Array.isArray(req.body.removeImages) &&
      req.body.removeImages.length > 0
    ) {
      listing.images = listing.images.filter(
        (img) => !req.body.removeImages.includes(img)
      );
      // Optionally: also delete from Cloudinary using the public_id
      for (const secure_url of req.body.removeImages) {
        const matches = secure_url.match(
          /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/
        );
        const public_id = matches ? matches[1] : null;
        if (public_id) {
          await cloudinary.uploader.destroy(public_id);
        }
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "listings" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          })
      );

      const uploadResults = await Promise.allSettled(uploadPromises);

      const newImages = uploadResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value.secure_url); // or .public_id

      if (newImages.length > 0) {
        listing.images = [...listing.images, ...newImages];
      }

      uploadResults
        .filter((result) => result.status === "rejected")
        .forEach((result) =>
          console.error("Image upload failed:", result.reason.message)
        );
    }

    Object.assign(listing, req.body);
    await listing.save();
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

export const getAllListings = async (req, res, next) => {
  try {
    const filter = buildQuery(req.query);

    // Parse pagination params with defaults
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await Listing.countDocuments(filter);

    // Fetch paginated results
    const listings = await Listing.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    res.json({
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOneAndDelete({
      _id: req.params.id,
      providerId: req.user.id,
    });
    if (!listing)
      return res
        .status(404)
        .json({ message: "Listing not found or not authorized" });

    // Delete all images from Cloudinary
    if (Array.isArray(listing.images) && listing.images.length > 0) {
      for (const secure_url of listing.images) {
        // Extract public_id from the secure_url
        const matches = secure_url.match(
          /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/
        );
        const public_id = matches ? matches[1] : null;
        if (public_id) {
          try {
            await cloudinary.uploader.destroy(public_id);
          } catch (e) {
            console.error(
              `Failed to delete image ${public_id} from Cloudinary:`,
              e.message
            );
          }
        }
      }
    }

    res.json({ message: "Listing and images deleted" });
  } catch (err) {
    next(err);
  }
};

export const updateListingRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ message: "Rating updated", rating: listing.rating });
  } catch (err) {
    next(err);
  }
};

export const updateListingNumReviews = async (req, res, next) => {
  try {
    const { numReviews } = req.body;
    if (!Number.isInteger(numReviews) || numReviews < 0) {
      return res.status(400).json({ message: "Invalid numReviews value" });
    }
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { numReviews },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({
      message: "Number of reviews updated",
      numReviews: listing.numReviews,
    });
  } catch (err) {
    next(err);
  }
};
