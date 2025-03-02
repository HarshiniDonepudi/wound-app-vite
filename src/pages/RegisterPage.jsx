import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RegisterForm from '../components/auth/RegisterForm';
import '../index.css';  // Ensure your global CSS is imported

const RegisterPage = () => {
  const { register, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    try {
      setIsSubmitting(true);
      await register(userData);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Wound Annotation Tool</h2>
        <p className="register-subtitle">Create a new account</p>

        {error && <div className="error-message">{error}</div>}

        <RegisterForm onSubmit={handleRegister} isSubmitting={isSubmitting} />

        <p className="register-login-text">
          Already have an account?{' '}
          <Link to="/login" className="register-login-link">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
