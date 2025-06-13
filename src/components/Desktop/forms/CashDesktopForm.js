// Formulario de caja para escritorio, usando componentes compartidos
import React from 'react';
import PropTypes from 'prop-types';

const CashDesktopForm = ({ form, handleChange, onSubmit, errorMsg }) => (
  <form onSubmit={onSubmit} className="flex flex-row gap-4 items-end">
    <div className="flex flex-col gap-2 flex-1">
      <select name="type" value={form.type} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full">
        <option value="ingreso">Ingreso</option>
        <option value="egreso">Egreso</option>
        <option value="gasto">Gasto</option>
      </select>
      <input type="number" name="price" value={form.price} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full" placeholder="Monto" />
      <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full">
        <option value="efectivo">Efectivo</option>
        <option value="mercadoPago">Mercado Pago</option>
      </select>
      <textarea name="notes" value={form.notes} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full" placeholder="Notas" />
      {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
      <button type="submit" className="bg-green-600 text-white rounded px-4 py-2 font-bold">Registrar movimiento</button>
    </div>
  </form>
);

CashDesktopForm.propTypes = {
  form: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  errorMsg: PropTypes.string,
};

export default CashDesktopForm;
