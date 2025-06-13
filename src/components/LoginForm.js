import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import PropTypes from 'prop-types';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      if (onLogin) onLogin();
    } catch (err) {
      setError('Email o contraseña incorrectos');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-xs w-full border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-green-700">Iniciar Sesión</h2>
        <div className="mb-3">
          <label className="block text-xs font-semibold mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded p-2 w-full text-sm" required autoFocus />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold mb-1">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border rounded p-2 w-full text-sm" required />
        </div>
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full font-bold" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  onLogin: PropTypes.func
};

export default LoginForm;
