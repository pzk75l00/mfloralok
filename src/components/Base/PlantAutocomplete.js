import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Componente reutilizable de input+select sincronizados para plantas
const PlantAutocomplete = ({ plants = [], value, onChange, label = 'Producto', required = false, disabled = false, classNameInput = '', classNameSelect = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [filtered, setFiltered] = useState(plants);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef();
  const selectRef = useRef();

  useEffect(() => {
    // Si value cambia desde fuera, actualizar inputValue
    const selected = plants.find(p => String(p.id) === String(value));
    setInputValue(selected ? selected.name : '');
  }, [value, plants]);

  useEffect(() => {
    if (inputValue === '') {
      setFiltered(plants);
    } else {
      setFiltered(
        plants.filter(p => p.name.toLowerCase().includes(inputValue.toLowerCase()))
      );
    }
  }, [inputValue, plants]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInput = e => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    // No cambiar value aún, solo filtrar
  };

  const handleSelect = e => {
    const val = e.target.value;
    onChange(val);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (plant) => {
    setInputValue(plant.name);
    onChange(plant.id);
    setShowSuggestions(false);
    // Opcional: enfocar el select
    selectRef.current && selectRef.current.focus();
  };

  const handleBlur = (e) => {
    // Timeout para permitir onMouseDown de sugerencia antes de cerrar
    setTimeout(() => setShowSuggestions(false), 100);
  };

  // Detectar móvil
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInput}
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleBlur}
        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${isMobile ? 'bg-[#f5f6fa] text-gray-800' : ''} ${classNameInput}`}
        placeholder="Buscar producto..."
        disabled={disabled}
        autoComplete="off"
        required={required}
      />
      {/* Sugerencias tipo autocompletar */}
      {showSuggestions && inputValue && filtered.length > 0 && (
        <ul className="border border-gray-200 rounded bg-white max-h-40 overflow-y-auto mt-1 absolute z-10 w-full shadow-lg">
          {filtered.slice(0, 8).map(plant => (
            <li
              key={plant.id}
              className="px-3 py-1 hover:bg-blue-100 cursor-pointer text-sm"
              onMouseDown={() => handleSuggestionClick(plant)}
            >
              {plant.name} (Stock: {plant.stock})
            </li>
          ))}
        </ul>
      )}
      {/* Select tradicional sincronizado */}
      <select
        ref={selectRef}
        className={`mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${isMobile ? 'bg-[#f5f6fa] text-gray-800' : ''} ${classNameSelect}`}
        value={value || ''}
        onChange={e => handleSelect(e)}
        required={required}
        disabled={disabled}
      >
        <option value="">Seleccionar producto</option>
        {filtered.map(plant => (
          <option key={plant.id} value={plant.id}>{plant.name} (Stock: {plant.stock})</option>
        ))}
      </select>
    </div>
  );
};

PlantAutocomplete.propTypes = {
  plants: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  label: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  classNameInput: PropTypes.string,
  classNameSelect: PropTypes.string,
};

export default PlantAutocomplete;
