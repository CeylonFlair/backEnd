import axios from 'axios';
import crypto from 'crypto';

const PAYHERE_BASE_URL = process.env.PAYHERE_BASE_URL || 'https://sandbox.payhere.lk';
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

// Generate hash for PayHere IPN verification
export function verifyPayHereSignature(data) {
  // For PayHere IPN, signature = md5(MERCHANT_ID + order_id + payment_id + payhere_amount + payhere_currency + status_code + md5(MERCHANT_SECRET))
  const md5Secret = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex');
  const str = MERCHANT_ID + data.order_id + data.payment_id + data.payhere_amount + data.payhere_currency + data.status_code + md5Secret;
  const signature = crypto.createHash('md5').update(str).digest('hex');
  return signature === data.md5sig;
}

// Create PayHere payment URL for redirection
export function getPayHereRedirectUrl({ orderId, amount, firstName, lastName, email, phone, address, city, items }) {
  const params = new URLSearchParams({
    merchant_id: MERCHANT_ID,
    return_url: process.env.PAYHERE_RETURN_URL,
    cancel_url: process.env.PAYHERE_CANCEL_URL,
    notify_url: process.env.PAYHERE_NOTIFY_URL,
    order_id: orderId,
    items: items || 'Order Payment',
    amount: amount.toFixed(2),
    currency: 'LKR',
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    address,
    city,
    country: 'Sri Lanka'
  });
  // PayHere wants a POST for server-to-server, but for redirects, just build URL
  return `${PAYHERE_BASE_URL}/pay/checkout?${params.toString()}`;
}