import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import PropTypes from 'prop-types';

const ProductTypesManager = ({ onClose }) => {
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'productTypes'), snap => {
      setTypes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!newType.trim()) return;
    await addDoc(collection(db, 'productTypes'), { name: newType.trim() });
    setNewType('');
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = async (id) => {
    if (!editingValue.trim()) return;
    await updateDoc(doc(db, 'productTypes', id), { name: editingValue.trim() });
    setEditingId(null);
    setEditingValue('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este tipo?')) return;
    await deleteDoc(doc(db, 'productTypes', id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs border border-gray-200">
        <h3 className="text-lg font-bold mb-2 text-green-700">Gestionar Tipos de Producto</h3>
        <div className="mb-4">
          <input
            type="text"
            value={newType}
            onChange={e => setNewType(e.target.value)}
            className="border rounded p-1 w-full text-xs mb-2"
            placeholder="Nuevo tipo..."
          />
          <button onClick={handleAdd} className="bg-green-600 text-white px-2 py-1 rounded text-xs w-full">Agregar</button>
        </div>
        <ul className="mb-4 max-h-40 overflow-y-auto divide-y divide-gray-100">
          {types.map(t => (
            <li key={t.id} className="flex items-center gap-2 py-1">
              {editingId === t.id ? (
                <>
                  <input value={editingValue} onChange={e => setEditingValue(e.target.value)} className="border rounded p-1 text-xs flex-1" />
                  <button onClick={() => handleUpdate(t.id)} className="text-green-700 text-xs font-bold">✔</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-500 text-xs">✕</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs">{t.name}</span>
                  <button onClick={() => handleEdit(t.id, t.name)} className="text-blue-600 text-xs">Editar</button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-600 text-xs">Eliminar</button>
                </>
              )}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="bg-gray-200 text-gray-700 px-3 py-1 rounded w-full mt-2">Cerrar</button>
      </div>
    </div>
  );
};

ProductTypesManager.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default ProductTypesManager;
