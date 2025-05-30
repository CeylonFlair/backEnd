// Integrate with speakeasy or similar for actual 2FA, this is a stub

export const generate2FASecret = (user) => {
  // Return a secret and QR code for user
  return { otpauth_url: 'otpauth://totp/...', secret: 'SECRET' };
};

export const verify2FACode = (user, code) => {
  // Verify given code against user's secret
  return true; // stub
};