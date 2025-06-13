// Autocompletado de productos para formularios
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PlantAutocomplete = ({ plants, value, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const filtered = plants.filter(p =>
    p.name.toLowerCase().includes(input.toLowerCase())
  );

  const handleSelect = (p) => {
    onChange(p.id);
    setInput(''); // Limpiar el input después de seleccionar
  };

  return (
    <div className="mb-2">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={placeholder || 'Buscar producto...'}
        className="border rounded px-2 py-1 w-full mb-1"
      />
      {input && (
        <div className="border rounded bg-white max-h-32 overflow-y-auto">
          {filtered.map(p => (
            <div
              key={p.id}
              className={`px-2 py-1 cursor-pointer hover:bg-blue-100 ${value === p.id ? 'bg-blue-200' : ''}`}
              onClick={() => handleSelect(p)}
            >
              {p.name}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-2 py-1 text-gray-400">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
};

PlantAutocomplete.propTypes = {
  plants: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default PlantAutocomplete;
