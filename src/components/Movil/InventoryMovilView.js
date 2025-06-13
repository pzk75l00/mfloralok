import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import ProductTypesManager from './ProductTypesManager';

const initialForm = { name: '', type: '', stock: 0, basePrice: 0, purchasePrice: 0, purchaseDate: '', supplier: '' };

const InventoryMovilView = () => {
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' o 'table'
  const [search, setSearch] = useState("");
  const [showTypesManager, setShowTypesManager] = useState(false);
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'plants'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlants(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'productTypes'), snap => {
      setProductTypes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'stock' || name === 'basePrice' || name === 'purchasePrice' ? Number(value) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.type.trim() || form.stock < 0 || form.basePrice < 0 || form.purchasePrice < 0) {
      alert('Todos los campos son obligatorios y deben ser válidos.');
      return;
    }
    if (form.basePrice > form.purchasePrice) {
      alert('El precio de compra no puede ser mayor al precio de venta.');
      return;
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const plantData = {
      id: editingId ? editingId : (Math.max(0, ...plants.map(p => Number(p.id) || 0)) + 1).toString(),
      name: form.name,
      type: form.type,
      stock: form.stock,
      basePrice: form.basePrice,
      purchasePrice: form.purchasePrice,
      purchaseDate: form.purchaseDate || todayStr,
      supplier: form.supplier || ''
    };
    try {
      await setDoc(doc(collection(db, 'plants'), plantData.id), plantData);
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      alert('Error guardando la planta.');
    }
  };

  const handleEdit = plant => {
    setForm({ name: plant.name, type: plant.type, stock: plant.stock, basePrice: plant.basePrice, purchasePrice: plant.purchasePrice, purchaseDate: plant.purchaseDate, supplier: plant.supplier });
    setEditingId(plant.id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar esta planta?')) return;
    await deleteDoc(doc(collection(db, 'plants'), id));
  };

  // Filtro de plantas según búsqueda
  const filteredPlants = plants.filter(plant => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      plant.name?.toLowerCase().includes(q) ||
      plant.type?.toLowerCase().includes(q) ||
      String(plant.stock).includes(q) ||
      String(plant.basePrice).includes(q) ||
      String(plant.purchasePrice).includes(q) ||
      (plant.supplier?.toLowerCase().includes(q) || "")
    );
  });

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      <div className="rounded-lg shadow bg-white p-3">
        {/* Barra de búsqueda */}
        <div className="mb-4 max-w-md mx-auto">
          <input
            type="text"
            className="border rounded p-2 w-full"
            placeholder="Buscar por nombre, tipo, proveedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex justify-center mb-2 gap-2">
          <button
            className={`px-3 py-1 rounded font-semibold text-sm ${viewMode === 'cards' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('cards')}
          >Vista de tarjetas</button>
          <button
            className={`px-3 py-1 rounded font-semibold text-sm ${viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('table')}
          >Vista de tabla</button>
          <button
            className="px-3 py-1 rounded font-semibold text-xs bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
            onClick={() => setShowTypesManager(true)}
          >Gestionar tipos</button>
        </div>
        {showTypesManager && <ProductTypesManager onClose={() => setShowTypesManager(false)} />}
        <button
          type="button"
          className="fixed bottom-20 right-4 z-50 bg-green-600 text-white rounded-full shadow-lg p-4 text-3xl md:hidden hover:bg-green-700 transition"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          onClick={() => setShowForm(true)}
          aria-label="Nuevo producto"
        >
          +
        </button>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30">
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <input name="name" value={form.name} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Nombre" required />
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" value={form.type} onChange={handleChange} className="border rounded p-2 w-full" required>
                <option value="">Tipo...</option>
                {productTypes.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <label className="text-sm font-medium text-gray-700">Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Stock" required />
              <label className="text-sm font-medium text-gray-700">Precio de Venta</label>
              <input name="purchasePrice" type="number" min="0" value={form.purchasePrice} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Precio de Venta" required />
              <label className="text-sm font-medium text-gray-700">Precio de Compra</label>
              <input name="basePrice" type="number" min="0" value={form.basePrice} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Precio de Compra" required />
              <label className="text-sm font-medium text-gray-700">Fecha de Compra</label>
              <input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} className="border rounded p-2 w-full" />
              <label className="text-sm font-medium text-gray-700">Proveedor (opcional)</label>
              <input name="supplier" value={form.supplier} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Proveedor (opcional)" />
              <div className="fixed left-0 right-0 bottom-0 z-[110] flex gap-2 p-4 bg-white border-t border-gray-300 shadow-lg" style={{height: 70}}>
                <button type="submit" className="bg-green-600 text-white px-4 py-3 rounded flex-1 text-lg font-semibold shadow">{editingId ? 'Actualizar' : 'Agregar'}</button>
                <button type="button" className="bg-gray-200 text-gray-700 px-4 py-3 rounded flex-1 text-lg font-semibold shadow" onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(false); }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredPlants
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(plant => {
                const isLowStock = Number(plant.stock) <= 1;
                const cardColor = isLowStock
                  ? 'bg-red-100 border-red-300'
                  : 'bg-green-50 border-green-200';
                return (
                  <div key={plant.id} className={`rounded-lg shadow p-3 flex flex-col items-start border ${cardColor} transition-colors duration-300`}>
                    <div className="font-bold text-base text-green-700 mb-1">{plant.name}</div>
                    <div className="text-xs text-gray-500 mb-1">{plant.type}</div>
                    <div className={`text-sm mb-1 ${isLowStock ? 'text-red-700 font-bold' : 'text-green-800'}`}>Stock: <b>{plant.stock}</b></div>
                    <div className="text-sm mb-1">Venta: <b>${plant.purchasePrice}</b></div>
                    <div className="flex gap-2 mt-2">
                      <button className="text-blue-600 underline text-xs" onClick={() => handleEdit(plant)}>Editar</button>
                      <button className="text-red-600 underline text-xs" onClick={() => handleDelete(plant.id)}>Eliminar</button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-2">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-green-100">
                  <th className="p-1">Nombre</th>
                  <th className="p-1">Tipo</th>
                  <th className="p-1">Stock</th>
                  <th className="p-1">Venta</th>
                  <th className="p-1">Compra</th>
                  <th className="p-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlants
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(plant => (
                    <tr key={plant.id} className="border-t">
                      <td className="p-1">{plant.name}</td>
                      <td className="p-1">{plant.type}</td>
                      <td className="p-1">{plant.stock}</td>
                      <td className="p-1">${plant.purchasePrice}</td>
                      <td className="p-1">${plant.basePrice}</td>
                      <td className="p-1 flex gap-1">
                        <button className="text-blue-600 underline text-xs" onClick={() => handleEdit(plant)}>Editar</button>
                        <button className="text-red-600 underline text-xs" onClick={() => handleDelete(plant.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryMovilView;
