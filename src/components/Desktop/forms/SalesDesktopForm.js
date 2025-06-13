// Formulario de ventas para escritorio, usando componentes compartidos
import React from 'react';
import PropTypes from 'prop-types';
import ProductFormFields from '../../Shared/ProductFormFields';
import ProductTable from '../../Shared/ProductTable';

const SalesDesktopForm = ({ form, productForm, plants, handleChange, handleProductFormChange, handleAddProduct, handleRemoveProduct, ventaTotal, products, onSubmit, errorMsg }) => (
  <form onSubmit={onSubmit} className="flex flex-row gap-4 items-end">
    <div className="flex flex-col gap-2 flex-1">
      <ProductFormFields productForm={productForm} plants={plants} handleProductFormChange={handleProductFormChange} />
      <button type="button" onClick={handleAddProduct} className="bg-blue-500 text-white rounded px-2 py-1">Agregar producto</button>
    </div>
    <div className="flex-1">
      <ProductTable products={products} handleRemoveProduct={handleRemoveProduct} />
      <div className="font-bold text-right">Total: ${ventaTotal}</div>
      <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full">
        <option value="efectivo">Efectivo</option>
        <option value="mercadoPago">Mercado Pago</option>
      </select>
      <textarea name="notes" value={form.notes} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full" placeholder="Notas" />
      {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
      <button type="submit" className="bg-green-600 text-white rounded px-4 py-2 font-bold">Registrar venta</button>
    </div>
  </form>
);

SalesDesktopForm.propTypes = {
  form: PropTypes.object.isRequired,
  productForm: PropTypes.object.isRequired,
  plants: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleProductFormChange: PropTypes.func.isRequired,
  handleAddProduct: PropTypes.func.isRequired,
  handleRemoveProduct: PropTypes.func.isRequired,
  ventaTotal: PropTypes.number.isRequired,
  products: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  errorMsg: PropTypes.string,
};

export default SalesDesktopForm;
