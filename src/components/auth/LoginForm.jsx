import React, { useState } from 'react';

const LoginForm = ({ onSubmit, isSubmitting }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form__group">
        <label htmlFor="username" className="login-form__label">
          Username
        </label>
        <div className="login-form__input-container">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-form__input"
          />
        </div>
      </div>

      <div className="login-form__group">
        <label htmlFor="password" className="login-form__label">
          Password
        </label>
        <div className="login-form__input-container">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-form__input"
          />
        </div>
      </div>

      <div className="login-form__group">
        <button
          type="submit"
          disabled={isSubmitting}
          className="login-form__submit"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
