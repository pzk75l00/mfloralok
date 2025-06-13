import React, { useState, useEffect } from 'react';
import PlantAutocomplete from './PlantAutocomplete';
import { registrarVenta } from './saleUtils';

// La fecha se registra automáticamente con la hora local de Argentina, pero no se muestra el campo al usuario
const getArgentinaNowISOString = () => {
  const now = new Date();
  const argNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  return argNow.toISOString();
};

const SalesForm = ({ plants, onCompleteSale }) => {
  const [saleData, setSaleData] = useState({
    plantId: '',
    quantity: 1,
    salePrice: '',
    paymentMethod: 'efectivo',
    date: getArgentinaNowISOString(), // fecha local Argentina
    location: '',
    notes: ''
  });

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (saleData.plantId) {
      const plant = plants.find(p => p.id === Number(saleData.plantId));
      setSelectedPlant(plant);
      setSaleData(prev => ({
        ...prev,
        salePrice: plant ? plant.basePrice : ''
      }));
    }
  }, [saleData.plantId, plants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaleData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'salePrice' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!saleData.salePrice || Number(saleData.salePrice) <= 0) {
      setErrorMsg('Debe ingresar un precio válido para la venta.');
      return;
    }
    if (!saleData.plantId) {
      setErrorMsg('Debe seleccionar un producto (planta, maceta u otro) para la venta.');
      return;
    }
    // Al registrar, siempre usar la hora local de Argentina
    const nowISO = getArgentinaNowISOString();
    const result = await registrarVenta({
      plantId: saleData.plantId,
      quantity: saleData.quantity,
      price: saleData.salePrice,
      paymentMethod: saleData.paymentMethod,
      date: nowISO,
      location: saleData.location,
      notes: saleData.notes
    });
    if (!result.ok) {
      setErrorMsg(result.error || 'Error al registrar la venta');
      return;
    }
    setSaleData({
      plantId: '',
      quantity: 1,
      salePrice: '',
      paymentMethod: 'efectivo',
      date: getArgentinaNowISOString(),
      location: '',
      notes: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Registrar Venta</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Planta</label>
            {/* Reemplazo: input+select sincronizados */}
            <PlantAutocomplete
              plants={plants}
              value={saleData.plantId}
              onChange={val => setSaleData(prev => ({ ...prev, plantId: val }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
            <input
              type="number"
              name="quantity"
              min="1"
              max={selectedPlant?.stock || ''}
              value={saleData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
            <input
              type="number"
              name="salePrice"
              value={saleData.salePrice}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
            <select
              name="paymentMethod"
              value={saleData.paymentMethod}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="efectivo">Efectivo (E)</option>
              <option value="mercadoPago">Mercado Pago (MP)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lugar</label>
            <input
              type="text"
              name="location"
              value={saleData.location}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observaciones</label>
          <textarea
            name="notes"
            value={saleData.notes}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows="2"
          />
        </div>

        <div className="pt-2">
          <p className="text-lg font-medium">
            Total: ${(saleData.quantity * saleData.salePrice).toFixed(2) || '0.00'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">{errorMsg}</div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Producto</label>
            {/* Reemplazo: input+select sincronizados */}
            <PlantAutocomplete
              plants={plants}
              value={saleData.plantId}
              onChange={val => setSaleData(prev => ({ ...prev, plantId: val }))}
              required
            />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          disabled={!saleData.plantId}
        >
          Registrar Venta
        </button>
      </div>
    </form>
  );
};

export default SalesForm;

// DONE