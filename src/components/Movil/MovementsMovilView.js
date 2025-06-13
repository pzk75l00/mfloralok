import React, { useState } from 'react';
import MovementsView from '../Base/MovementsView';

// Vista móvil para Movimientos: lista de movimientos del día
const MovementsMovilView = (props) => {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      <h2 className="text-lg font-bold mb-4 text-center">Movimientos del Día</h2>
      {/* Botón para alternar formulario (opcional) */}
      <div className="flex justify-center mb-2">
        <button
          className={`px-3 py-1 rounded font-semibold text-xs ${showForm ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setShowForm(f => !f)}
        >{showForm ? 'Ocultar formulario' : 'Registrar movimiento'}</button>
      </div>
      {showForm && (
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <h2 className="text-base font-bold mb-2 text-green-700">Registrar movimiento</h2>
          <MovementsView {...props} showOnlyForm={true} />
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-base font-bold mb-2 text-blue-700">Historial de movimientos</h2>
        <MovementsView {...props} hideForm={true} />
      </div>
    </div>
  );
};

export default MovementsMovilView;
