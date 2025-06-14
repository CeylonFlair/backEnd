import axios from "axios";
const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:5003";

export const getOrderDetails = async (orderId, token) => {
  try {
    const { data } = await axios.get(
      `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(`Fetched order details for order ID ${orderId}:`, data);
    return data;
  } catch (error) {
    console.log(
      `Failed to fetch order details for order ID ${orderId}: ${error}`
    );
    return null;
  }
};

export const notifyOrderPaid = async (orderId, token) => {
  try {
    const { data } = await axios.patch(
      `${ORDER_SERVICE_URL}/api/orders/${orderId}/payment-status`,
      { paymentStatus: "paid" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(
      `Notified order service about payment for order ID ${orderId}:`,
      data
    );
    return data;
  } catch (error) {
    console.log(
      `Failed to notify order service about payment for order ID ${orderId}: ${error}`
    );
    return null;
  }
};

// Optionally, you can add a notifyOrderPaid() if you want to inform the order service when payment is successful.
