import axios from 'axios';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';

export const getOrderDetails = async (orderId, token) => {
  try {
    const { data } = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch {
    return null;
  }
};

export const notifyOrderPaid = async (orderId, token) => {
  try {
    const { data } = await axios.patch(
      `${ORDER_SERVICE_URL}/api/orders/${orderId}/payment-status`,
      { paymentStatus: 'paid' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error('Failed to notify order service:', error);
    return null;
  }
}

// Optionally, you can add a notifyOrderPaid() if you want to inform the order service when payment is successful.