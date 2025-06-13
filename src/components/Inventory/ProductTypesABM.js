import React from 'react';
import ProductTypesManager from './ProductTypesManager';

// Componente independiente para el ABM de tipos de producto
const ProductTypesABM = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Gestión de Tipos de Producto</h2>
      <ProductTypesManager />
    </div>
  );
};

export default ProductTypesABM;
