import Listing from "../models/Listing.js";
import { buildQuery, getSortOption } from "../utils/buildQuery.js";
import { getUserById } from "../services/userService.js";
import cloudinary from "../config/cloudinary.js";

export const createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      category,
      deliveryTime,
      numberOfRevisions,
      features,
    } = req.body;
    let imageUrls = [];
    let coverImageUrl = null;
    let imageUploadWarning = null;

    // Handle coverImage upload
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      try {
        const file = req.files.coverImage[0];
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "listings/cover" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        coverImageUrl = result.secure_url;
      } catch (err) {
        console.error("Cover image upload failed:", err.message);
        imageUploadWarning = "Cover image upload failed.";
      }
    }

    // Handle images upload
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map(
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

      if (req.files.images.length > 0 && imageUrls.length === 0) {
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
      coverImage: coverImageUrl,
      deliveryTime,
      numberOfRevisions,
      features,
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

    // Handle coverImage upload (replace existing)
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      try {
        // Optionally: delete old cover image from Cloudinary
        if (listing.coverImage) {
          const matches = listing.coverImage.match(
            /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/
          );
          const public_id = matches ? matches[1] : null;
          if (public_id) {
            await cloudinary.uploader.destroy(public_id);
          }
        }
        const file = req.files.coverImage[0];
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "listings/cover" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        listing.coverImage = result.secure_url;
      } catch (err) {
        console.error("Cover image upload failed:", err.message);
      }
    }

    // Handle new images upload
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map(
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
        .map((result) => result.value.secure_url);

      if (newImages.length > 0) {
        listing.images = [...listing.images, ...newImages];
      }

      uploadResults
        .filter((result) => result.status === "rejected")
        .forEach((result) =>
          console.error("Image upload failed:", result.reason.message)
        );
    }

    // Only update allowed fields
    const updatableFields = [
      "title",
      "description",
      "price",
      "category",
      "deliveryTime",
      "numberOfRevisions",
      "features",
      "coverImage",
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });
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

    // Sorting
    const sort = getSortOption(req.query.sort);

    // Get total count for pagination info
    const total = await Listing.countDocuments(filter);

    // Fetch paginated results with sorting
    const listings = await Listing.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Fetch provider info for each listing (in parallel)
    const token = req.headers.authorization?.split(" ")[1];
    const providerIds = [
      ...new Set(listings.map((l) => l.providerId.toString())),
    ];
    let providerMap = {};
    if (token) {
      await Promise.all(
        providerIds.map(async (providerId) => {
          try {
            const provider = await getUserById(providerId, token);
            providerMap[providerId] = {
              name: provider.name,
              profilePicture: provider.profilePicture,
            };
          } catch (e) {
            providerMap[providerId] = null;
          }
        })
      );
    }

    res.json({
      listings: listings.map((listing) => {
        const obj = listing.toObject();
        const provider = providerMap[listing.providerId.toString()];
        return {
          ...obj,
          provider: provider
            ? {
                name: provider.name,
                profilePicture: provider.profilePicture,
              }
            : null,
        };
      }),
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

    // Delete cover image from Cloudinary
    if (listing.coverImage) {
      // Extract public_id for listings/cover images
      // This regex will match the path after /upload/ and before the file extension
      const matches = listing.coverImage.match(
        /\/upload\/(?:v\d+\/)?([^/.]+\/[^/.]+)\.[a-zA-Z0-9]+$/
      );
      let public_id = null;
      if (matches && matches[1]) {
        public_id = matches[1];
      } else {
        // fallback: try to extract everything after /upload/ and before extension
        const fallback = listing.coverImage.match(
          /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/
        );
        public_id = fallback ? fallback[1] : null;
      }
      if (public_id) {
        try {
          await cloudinary.uploader.destroy(public_id);
        } catch (e) {
          console.error(
            `Failed to delete cover image ${public_id} from Cloudinary:`,
            e.message
          );
        }
      } else {
        console.warn(
          "Could not extract public_id for cover image:",
          listing.coverImage
        );
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
