// Tabla reutilizable para mostrar productos agregados a la venta/caja
import React from 'react';
import PropTypes from 'prop-types';

const ProductTable = ({ products, handleRemoveProduct }) => (
  <table className="min-w-full text-xs mb-2">
    <thead>
      <tr>
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio</th>
        <th>Total</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {products.map((p, idx) => (
        <tr key={idx}>
          <td>{p.name}</td>
          <td>{p.quantity}</td>
          <td>${p.price}</td>
          <td>${p.total}</td>
          <td>
            <button type="button" onClick={() => handleRemoveProduct(idx)} className="text-red-500">Eliminar</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  handleRemoveProduct: PropTypes.func.isRequired,
};

export default ProductTable;
