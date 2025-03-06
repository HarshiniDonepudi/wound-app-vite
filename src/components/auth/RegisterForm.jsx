import React, { useState } from 'react';


const RegisterForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'annotator'
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <div className="mt-1">
        <input
  id="username"
  name="username"
  type="text"
  autoComplete="username"
  required
  value={formData.username}
  onChange={handleChange}
  style={{
    width: "100%",
    padding: "14px", // Bigger padding
    fontSize: "18px", // Bigger font size
    height: "40px", // Taller input box
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)"
  }}
/>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="mt-1">
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "14px", // Bigger padding
              fontSize: "18px", // Bigger font size
              height: "40px", // Taller input box
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)"
            }}
            />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "14px", // Bigger padding
              fontSize: "18px", // Bigger font size
              height: "40px", // Taller input box
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)"
            }}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "14px", // Bigger padding
              fontSize: "18px", // Bigger font size
              height: "40px", // Taller input box
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)"
            }}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <div className="mt-1">
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "5px", // Bigger padding
              fontSize: "14px", // Bigger font size
              height: "40px", // Taller input box
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)"
            }}
          >
            <option value="annotator">Annotator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div>
      <button
  type="submit"
  disabled={isSubmitting}
  style={{
    width: "100%",
    backgroundColor: isSubmitting ? "#3b82f6" : "#2563eb", // Blue color
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    opacity: isSubmitting ? 0.6 : 1,
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "10px"
  }}
>
  {isSubmitting ? 'Registering...' : 'Register'}
</button>

      </div>
    </form>
  );
};

export default RegisterForm;