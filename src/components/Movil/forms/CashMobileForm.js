// Formulario de caja para móvil, usando componentes compartidos
import React from 'react';
import PropTypes from 'prop-types';
import ProductFormFields from '../../Shared/ProductFormFields';
import ProductTable from '../../Shared/ProductTable';

const CashMobileForm = ({ form, productForm, plants, handleChange, handleProductFormChange, handleAddProduct, handleRemoveProduct, products, ventaTotal, onSubmit, errorMsg }) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-3 items-stretch">
    <select name="type" value={form.type} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full">
      <option value="venta">Venta</option>
      <option value="compra">Compra</option>
      <option value="ingreso">Ingreso</option>
      <option value="egreso">Egreso</option>
      <option value="gasto">Gasto</option>
    </select>
    {(form.type === 'venta' || form.type === 'compra') && (
      <>
        <ProductFormFields productForm={productForm} plants={plants} handleProductFormChange={handleProductFormChange} />
        <button type="button" onClick={handleAddProduct} className="bg-blue-500 text-white rounded px-2 py-1">Agregar producto</button>
        <ProductTable products={products} handleRemoveProduct={handleRemoveProduct} />
        <div className="font-bold text-right">Total: ${ventaTotal}</div>
      </>
    )}
    {(form.type === 'ingreso' || form.type === 'egreso' || form.type === 'gasto') && (
      <input type="text" name="detail" value={form.detail} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full" placeholder="Detalle" />
    )}
    <input type="number" name="price" value={form.price} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full" placeholder="Monto" />
    <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full">
      <option value="efectivo">Efectivo</option>
      <option value="mercadoPago">Mercado Pago</option>
    </select>
    <input type="text" name="location" value={form.location} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full" placeholder="Lugar" />
    <textarea name="notes" value={form.notes} onChange={handleChange} className="border rounded px-2 py-1 mb-2 w-full" placeholder="Notas" />
    {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
    <button type="submit" className="bg-green-600 text-white rounded px-4 py-2 font-bold">Registrar movimiento</button>
  </form>
);

CashMobileForm.propTypes = {
  form: PropTypes.object.isRequired,
  productForm: PropTypes.object.isRequired,
  plants: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleProductFormChange: PropTypes.func.isRequired,
  handleAddProduct: PropTypes.func.isRequired,
  handleRemoveProduct: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  ventaTotal: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  errorMsg: PropTypes.string,
};

export default CashMobileForm;
