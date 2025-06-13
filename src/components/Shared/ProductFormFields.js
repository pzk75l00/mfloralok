// Campos reutilizables para formularios de productos (ventas/caja)
import React from 'react';
import PropTypes from 'prop-types';
import PlantAutocomplete from './PlantAutocomplete';

const ProductFormFields = ({ productForm, plants, handleProductFormChange }) => {
  const selectedPlant = plants.find(p => String(p.id) === String(productForm.plantId));
  return (
    <>
      <label className="text-xs font-semibold">Producto</label>
      <select
        name="plantId"
        value={productForm.plantId}
        onChange={handleProductFormChange}
        className="border rounded px-2 py-1 mb-2 w-full"
      >
        <option value="">Seleccionar producto</option>
        {plants.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <PlantAutocomplete
        plants={plants}
        value={productForm.plantId}
        onChange={id => handleProductFormChange({ target: { name: 'plantId', value: id } })}
        placeholder="Buscar producto..."
      />
      {selectedPlant && (
        <div className="text-xs text-gray-500 mb-2">Stock disponible: <b>{selectedPlant.stock ?? 0}</b></div>
      )}
      <input
        type="number"
        name="quantity"
        min="1"
        value={productForm.quantity}
        onChange={handleProductFormChange}
        className="border rounded px-2 py-1 mb-2 w-full"
        placeholder="Cantidad"
      />
      <input
        type="number"
        name="price"
        min="0"
        value={productForm.price}
        onChange={handleProductFormChange}
        className="border rounded px-2 py-1 mb-2 w-full"
        placeholder="Precio"
      />
    </>
  );
};

ProductFormFields.propTypes = {
  productForm: PropTypes.object.isRequired,
  plants: PropTypes.array.isRequired,
  handleProductFormChange: PropTypes.func.isRequired,
};

export default ProductFormFields;
