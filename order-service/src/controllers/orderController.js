import Order from "../models/Order.js";
import { getListingById } from "../services/listingService.js";
import { getUserById } from "../services/userService.js";

// Customer creates new order/booking
export const createOrder = async (req, res, next) => {
  try {
    const { listingId, bookingDate, notes } = req.body;
    // Call Listing Service to get providerId and price
    const listing = await getListingById(
      listingId,
      req.headers.authorization?.split(" ")[1]
    );
    if (!listing || !listing.isActive)
      return res.status(400).json({ message: "Invalid or inactive listing" });

    const order = await Order.create({
      customerId: req.user.id,
      providerId: listing.providerId,
      listingId,
      price: listing.price,
      bookingDate,
      notes,
    });
    res.status(201).json({ message: "Order created successfully" });
  } catch (err) {
    next(err);
  }
};

// Get orders for logged-in customer
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user.id }).sort(
      "-createdAt"
    );
    const token = req.headers.authorization?.split(" ")[1];

    // Collect unique user IDs
    const userIds = new Set();
    orders.forEach((order) => {
      userIds.add(order.customerId.toString());
      userIds.add(order.providerId.toString());
    });

    // Fetch user info for all involved users
    const userMap = {};
    await Promise.all(
      Array.from(userIds).map(async (userId) => {
        try {
          const user = await getUserById(userId, token);
          userMap[userId] = { name: user.name };
        } catch (e) {
          userMap[userId] = { name: null };
        }
      })
    );

    res.json(
      orders.map((order) => ({
        ...order.toObject(),
        customer: userMap[order.customerId.toString()],
        provider: userMap[order.providerId.toString()],
      }))
    );
  } catch (err) {
    next(err);
  }
};

// Get orders for a provider (artisan)
export const getProviderOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ providerId: req.user.id }).sort(
      "-createdAt"
    );
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Get order details (customer or provider only)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      order.customerId.toString() !== req.user.id &&
      order.providerId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Provider updates order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.providerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the provider can update status" });
    }
    order.status = req.body.status;
    await order.save();
    res.json({
      message: "Order status updated successfully",
      order_id: order._id,
      new_status: order.status,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Allow internal service calls to update payment status
    if (!req.user.service) {
      // Optionally, restrict to customer or provider
      if (order.providerId.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Only providers can change payment status" });
      }
    }

    order.paymentStatus = req.body.paymentStatus;
    await order.save();
    res.json({
      message: "Payment status updated successfully",
      order_id: order._id,
      new_payment_status: order.paymentStatus,
    });
  } catch (err) {
    next(err);
  }
};
