import React, { useState } from 'react';
import { registerUser } from '../firebase/UserService';
import PropTypes from 'prop-types';

const initialForm = {
  email: '',
  password: '',
  nombre: '',
  apellido: '',
  telefono: '',
  rol: 'usuario',
  modules: ['basico']
};

const UserRegisterForm = ({ onUserCreated, isDios = false }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleModulesChange = e => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setForm(f => ({ ...f, modules: selected }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await registerUser({
        ...form,
        rol: isDios ? form.rol : 'usuario',
        modules: form.modules.length ? form.modules : ['basico']
      });
      setSuccess('Usuario registrado correctamente');
      setForm(initialForm);
      if (onUserCreated) onUserCreated();
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Registrar Usuario</h2>
      <div className="mb-2">
        <label className="block text-xs font-semibold">Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} className="border rounded p-2 w-full text-sm" required />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-semibold">Contraseña</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} className="border rounded p-2 w-full text-sm" required />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-semibold">Nombre</label>
        <input name="nombre" value={form.nombre} onChange={handleChange} className="border rounded p-2 w-full text-sm" required />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-semibold">Apellido</label>
        <input name="apellido" value={form.apellido} onChange={handleChange} className="border rounded p-2 w-full text-sm" required />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-semibold">Teléfono</label>
        <input name="telefono" value={form.telefono} onChange={handleChange} className="border rounded p-2 w-full text-sm" required />
      </div>
      {isDios && (
        <div className="mb-2">
          <label className="block text-xs font-semibold">Rol</label>
          <select name="rol" value={form.rol} onChange={handleChange} className="border rounded p-2 w-full text-sm">
            <option value="usuario">Usuario</option>
            <option value="admin">Admin</option>
            <option value="dios">Dios</option>
          </select>
        </div>
      )}
      <div className="mb-2">
        <label className="block text-xs font-semibold">Módulos habilitados</label>
        <select name="modules" multiple value={form.modules} onChange={handleModulesChange} className="border rounded p-2 w-full text-sm">
          <option value="basico">Básico</option>
          <option value="ventas">Ventas</option>
          <option value="reportes">Reportes</option>
          <option value="inventario">Inventario</option>
          <option value="compras">Compras</option>
        </select>
        <span className="text-xs text-gray-500">Ctrl+Click para seleccionar varios</span>
      </div>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {success && <div className="text-green-700 text-xs mb-2">{success}</div>}
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold mt-2" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
};

UserRegisterForm.propTypes = {
  onUserCreated: PropTypes.func,
  isDios: PropTypes.bool
};

export default UserRegisterForm;
