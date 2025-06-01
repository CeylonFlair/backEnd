import Payment from "../models/Payment.js";
import { getOrderDetails, notifyOrderPaid } from "../services/orderService.js";
import {
  getPayHereRedirectUrl,
  verifyPayHereSignature,
} from "../services/payhereService.js";

// Initiate payment (creates Payment, returns PayHere URL)
export const initiatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    // Check for valid order (must exist, belong to user, be payable)
    const order = await getOrderDetails(orderId, token);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.customerId !== req.user.id)
      return res.status(403).json({ message: "Not your order" });
    if (order.status === "cancelled" || order.status === "completed")
      return res.status(400).json({ message: "Order not payable" });
    // Upsert payment record
    let payment = await Payment.findOneAndUpdate(
      { order: orderId },
      {
        order: orderId,
        payer: req.user.id,
        amount: order.price,
        currency: order.currency || "LKR",
        status: "pending",
      },
      { upsert: true, new: true }
    );
    // Build PayHere URL (use order/customer details for form fields)
    const url = getPayHereRedirectUrl({
      orderId,
      amount: order.price,
      firstName: order.customerFirstName || req.user.firstName || "Customer",
      lastName: order.customerLastName || req.user.lastName || "User",
      email: order.customerEmail || req.user.email || "test@sandbox.com",
      phone: order.customerPhone || "0770000000",
      address: order.customerAddress || "N/A",
      city: order.customerCity || "Colombo",
      items: order.itemTitle || "Order Payment",
    });
    res.json({ paymentId: payment._id, url });
  } catch (err) {
    next(err);
  }
};

// PayHere IPN endpoint
export const handlePayhereIPN = async (req, res, next) => {
  try {
    const data = req.body;
    // Verify signature
    if (!verifyPayHereSignature(data)) {
      return res.status(400).json({ message: "Invalid signature." });
    }
    // Find payment by order_id
    const payment = await Payment.findOne({ order: data.order_id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Update payment status
    let newStatus = "pending";
    if (data.status_code === "2") newStatus = "paid";
    else if (data.status_code === "0") newStatus = "pending";
    else newStatus = "failed";

    payment.status = newStatus;
    payment.payherePaymentId = data.payment_id;
    payment.payhereStatus = data.status_code;
    payment.payhereData = data;
    await payment.save();

    // Notify order service about payment status
    const orderDetails = await getOrderDetails(
      data.order_id,
      req.headers.authorization?.split(" ")[1]
    );
    if (orderDetails) {
      await notifyOrderPaid(
        data.order_id,
        req.headers.authorization?.split(" ")[1]
      );
    }

    res.status(200).send("OK");
  } catch (err) {
    console.log("Error handling PayHere IPN: ${err}");
    next(err);
  }
};

// (Optional) Get payment status for an order
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ status: payment.status, payhereStatus: payment.payhereStatus });
  } catch (err) {
    next(err);
  }
};
