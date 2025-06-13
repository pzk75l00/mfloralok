import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TYPE_OPTIONS = [
  'Plantas de Interior',
  'Plantas de Exterior',
  'Macetas',
  'Otros'
];

const PlantCard = ({ plant, onEdit, onDelete }) => {
  const [editType, setEditType] = useState(false);
  const [editStock, setEditStock] = useState(false);
  const [editPrice, setEditPrice] = useState(false);
  const [localType, setLocalType] = useState(plant.type);
  const [localStock, setLocalStock] = useState(plant.stock);
  const [localPrice, setLocalPrice] = useState(plant.purchasePrice);
  const [loading, setLoading] = useState(false);

  // Mostrar siempre la imagen genérica salvo que haya personalizada
  let imgSrc = '/img/plants/generic_plants.jpg';
  if (plant.image && typeof plant.image === 'string' && plant.image.trim() !== '') {
    imgSrc = plant.image;
  }

  // Simulación de update (reemplaza por lógica real si usas backend)
  const updateField = async (field, value) => {
    setLoading(true);
    // Llama a onEdit con el nuevo valor actualizado
    await onEdit({ ...plant, [field]: value });
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <div className="bg-[#f7f7fa] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-300">
      <div className="flex flex-col items-center p-4">
        <img
          src={imgSrc}
          alt={plant.name}
          className="h-32 w-32 object-cover rounded-lg border border-gray-200 bg-gray-50 mb-2"
          loading="lazy"
        />
        <h3 className="text-xl font-semibold text-gray-800 truncate w-full text-center mb-1">{plant.name}</h3>
        {/* Tipo editable debajo del nombre */}
        <div className="mb-2 w-full text-center">
          {editType ? (
            <select
              className="border rounded p-1 text-xs w-32 border-gray-300 focus:ring-blue-400"
              value={localType}
              autoFocus
              disabled={loading}
              onChange={e => setLocalType(e.target.value)}
              onBlur={async () => {
                setEditType(false);
                if (localType !== plant.type) await updateField('type', localType);
              }}
              onKeyDown={async e => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  setEditType(false);
                  if (localType !== plant.type) await updateField('type', localType);
                }
              }}
            >
              {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <span onClick={() => setEditType(true)} className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full cursor-pointer">{localType}</span>
          )}
        </div>
        {/* Precio y stock debajo del tipo */}
        <div className="grid grid-cols-2 gap-2 w-full mb-2">
          <div className="text-center">
            <p className="text-sm text-gray-500">Precio venta</p>
            <span className="font-medium cursor-pointer text-gray-800" onClick={() => setEditPrice(true)}>
              {editPrice ? (
                <input
                  type="number"
                  className="border rounded p-1 text-xs w-20 text-center border-gray-300 focus:ring-blue-400"
                  value={localPrice}
                  min={0}
                  autoFocus
                  disabled={loading}
                  onChange={e => setLocalPrice(e.target.value)}
                  onBlur={async () => {
                    setEditPrice(false);
                    if (String(localPrice) !== String(plant.purchasePrice)) await updateField('purchasePrice', Number(localPrice));
                  }}
                  onKeyDown={async e => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      setEditPrice(false);
                      if (String(localPrice) !== String(plant.purchasePrice)) await updateField('purchasePrice', Number(localPrice));
                    }
                  }}
                />
              ) : <b>${plant.purchasePrice}</b>}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Stock</p>
            <span
              className={`font-medium cursor-pointer ${Number(plant.stock) <= 1 ? 'text-red-700' : 'text-gray-800'}`}
              onClick={() => setEditStock(true)}
            >
              {editStock ? (
                <input
                  type="number"
                  className="border rounded p-1 text-xs w-16 text-center border-gray-300 focus:ring-blue-400"
                  value={localStock}
                  min={0}
                  autoFocus
                  disabled={loading}
                  onChange={e => setLocalStock(e.target.value)}
                  onBlur={async () => {
                    setEditStock(false);
                    if (String(localStock) !== String(plant.stock)) await updateField('stock', Number(localStock));
                  }}
                  onKeyDown={async e => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      setEditStock(false);
                      if (String(localStock) !== String(plant.stock)) await updateField('stock', Number(localStock));
                    }
                  }}
                />
              ) : <b>{plant.stock}</b>}
              <span className="text-xs text-gray-500 ml-1">unidades</span>
            </span>
          </div>
        </div>
        <div className="mt-2 flex space-x-2 w-full justify-center">
          <button
            onClick={() => onEdit(plant)}
            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(plant.id)}
            className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
          >
            Eliminar
          </button>
        </div>
        {loading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-xs text-gray-500">Guardando...</div>}
      </div>
    </div>
  );
};

PlantCard.propTypes = {
  plant: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    purchasePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    basePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    purchaseDate: PropTypes.string,
    supplier: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default PlantCard;
