/**
 * api.js — Single Responsibility: all network calls to the Google Apps Script backend.
 * No component should call fetch() directly.
 */

const GAS_URL = import.meta.env.VITE_SHEET_API_URL;

const post = (body) =>
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  }).then((res) => res.json());

/** Authenticate a partner with email + password */
export const apiLogin = ({ email, password }) =>
  post({ action: 'login', email, password });

/** Send a verification OTP to the given email */
export const apiSendOtp = ({ email, name }) =>
  post({ action: 'sendOTP', email, name });

/** Verify OTP and complete partner registration */
export const apiRegister = (formData, otp) =>
  post({ action: 'registerReferrer', ...formData, otp });

/** Fetch dashboard data by referral code */
export const apiGetDashboard = (referralCode) =>
  post({ action: 'getDashboard', referralCode });
