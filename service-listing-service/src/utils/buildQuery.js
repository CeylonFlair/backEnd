// Builds Mongo query for filtering/search
export const buildQuery = (query) => {
  const filter = {};

  // Category filter
  if (query.category) filter.category = query.category;

  // Provider filter
  if (query.providerId) filter.providerId = query.providerId;

  // Budget filter (minPrice, maxPrice)
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // Keyword search
  if (query.keyword) {
    filter.$or = [
      { title: { $regex: query.keyword, $options: "i" } },
      { description: { $regex: query.keyword, $options: "i" } },
    ];
  }

  // Minimum rating filter
  if (query.minRating) filter.rating = { $gte: Number(query.minRating) };

  return filter;
};

// Sorting helper
export const getSortOption = (sort) => {
  switch ((sort || "").toLowerCase()) {
    case "popular":
      // Sort by rating desc, then numReviews desc, then newest
      return { rating: -1, numReviews: -1, createdAt: -1 };
    case "newest":
      return { createdAt: -1 };
    default:
      // Default: newest first
      return { createdAt: -1 };
  }
};
