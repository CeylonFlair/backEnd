import axios from 'axios';

const LISTING_SERVICE_URL = process.env.LISTING_SERVICE_URL || 'http://localhost:5002';

export const getListingById = async (listingId, token) => {
  try {
    const response = await axios.get(`${LISTING_SERVICE_URL}/api/listings/${listingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch listing info');
  }
};