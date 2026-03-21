/**
 * useLogin — Single Responsibility: login form state + submit logic.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin } from '../services/api';
import { useAuth } from './useAuth';

export const useLogin = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiLogin(formData);
      if (data.success) {
        saveSession({
          name:         data.user.name,
          email:        formData.email,
          status:       data.user.status,
          referralCode: data.user.referralCode,
          category:     data.user.category || '',
        });
        navigate('/dashboard');
      } else {
        setError(data.error || data.message || 'Invalid email or password.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, handleChange, handleSubmit };
};
