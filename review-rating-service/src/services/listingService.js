import axios from "axios";
const LISTING_SERVICE_URL =
  process.env.LISTING_SERVICE_URL || "http://localhost:5002";

export const updateListingAverageRating = async (
  listingId,
  avgRating,
  token,
  updateType
) => {
  try {
    // 1. Get current listing
    const { data: listing } = await axios.get(
      `${LISTING_SERVICE_URL}/api/listings/${listingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    let numberOfReviews = listing.numberOfReviews || 0;

    // 2. Adjust number of reviews
    if (updateType === "delete") {
      numberOfReviews = Math.max(0, numberOfReviews - 1);
    } else if (updateType === "create") {
      numberOfReviews += 1;
    }
    // 'update' leaves numberOfReviews unchanged

    // 3. Update listing
    await axios.patch(
      `${LISTING_SERVICE_URL}/api/listings/${listingId}/rating`,
      { rating: avgRating },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await axios.patch(
      `${LISTING_SERVICE_URL}/api/listings/${listingId}/numReviews`,
      { numReviews: numberOfReviews },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    // Log but don't throw, avoid breaking review flow
    console.error("Failed to update listing rating:", error.message);
  }
};
