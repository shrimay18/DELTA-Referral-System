/**
 * useSignup — Single Responsibility: OTP signup flow state + submit logic.
 */
import { useState } from 'react';
import { apiSendOtp, apiRegister } from '../services/api';

export const useSignup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', upi: '', category: 'SST Student',
  });
  const [otpStep,    setOtpStep]    = useState('form'); // 'form' | 'otp'
  const [otpValue,   setOtpValue]   = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [otpError,   setOtpError]   = useState('');
  const [submitted,  setSubmitted]  = useState(false);

  const field = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    try {
      const json = await apiSendOtp({ email: formData.email, name: formData.name });
      if (json.success) setOtpStep('otp');
      else {
        // GAS may return "already exists" in message
        if (json.message?.toLowerCase().includes('already') || json.message?.toLowerCase().includes('exists')) {
          setOtpError('already_exists');
        } else {
          setOtpError(json.message || 'Could not send OTP. Try again.');
        }
      }
    } catch {
      setOtpError('Server error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    try {
      const json = await apiRegister(formData, otpValue);
      if (!json.success) {
        setOtpError(json.error || json.message || 'Invalid OTP. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setOtpError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetOtp = () => { setOtpStep('form'); setOtpError(''); };

  return {
    formData, field,
    otpStep, otpValue, setOtpValue,
    otpLoading, loading, otpError,
    submitted,
    handleSendOtp, handleVerifyAndRegister, resetOtp,
  };
};
