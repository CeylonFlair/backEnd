import md5 from "crypto-js/md5.js";
import "dotenv/config";

const PAYHERE_BASE_URL =
  process.env.PAYHERE_BASE_URL || "https://sandbox.payhere.lk";
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

// Generate hash for PayHere IPN verification
export function verifyPayHereSignature(data) {
  const md5Secret = md5(MERCHANT_SECRET).toString().toUpperCase();

  const signature = md5(
    MERCHANT_ID +
      data.order_id +
      data.payhere_amount +
      data.payhere_currency +
      data.status_code +
      md5Secret
  )
    .toString()
    .toUpperCase();
  return signature === data.md5sig;
}

// Generate hash for PayHere redirect
function generatePayHereHash({ orderId, amount, currency = "LKR" }) {
  const hashedSecret = md5(MERCHANT_SECRET).toString().toUpperCase();

  const amountFormatted = parseFloat(amount)
    .toLocaleString("en-us", { minimumFractionDigits: 2 })
    .replaceAll(",", "");

  let hash = md5(
    MERCHANT_ID + orderId + amountFormatted + currency + hashedSecret
  )
    .toString()
    .toUpperCase();
  return hash;
}

// Return PayHere payment data object for frontend POST
export function getPayHereRedirectUrl({
  orderId,
  amount,
  firstName,
  lastName,
  email,
  phone,
  address,
  city,
  items,
}) {
  const currency = "LKR";
  const amountFormatted = parseFloat(amount)
    .toLocaleString("en-us", { minimumFractionDigits: 2 })
    .replaceAll(",", "");
  const hash = generatePayHereHash({
    orderId,
    amount: amountFormatted,
    currency,
  });

  return {
    merchant_id: MERCHANT_ID,
    return_url: process.env.PAYHERE_RETURN_URL,
    cancel_url: process.env.PAYHERE_CANCEL_URL,
    notify_url: process.env.PAYHERE_NOTIFY_URL,
    order_id: orderId,
    items: items || "Order Payment",
    amount: amountFormatted,
    currency,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    address,
    city,
    country: "Sri Lanka",
    hash,
  };
}
