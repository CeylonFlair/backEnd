// Builds Mongo query for filtering/search
export const buildQuery = (query) => {
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.providerId) filter.providerId = query.providerId;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.keyword) {
    filter.$or = [
      { title: { $regex: query.keyword, $options: 'i' } },
      { description: { $regex: query.keyword, $options: 'i' } }
    ];
  }
  if (query.minRating) filter.rating = { $gte: Number(query.minRating) };

  return filter;
};