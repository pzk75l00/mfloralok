import React, { useState } from 'react';
import MovementsView from '../Base/MovementsView';

// Vista móvil para Ventas Diarias: formulario de ventas/compras del día y totales
const SalesMovilView = (props) => {
  // Selector de mes y año
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(now.toISOString().slice(0, 10));
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  const handleMonthChange = (e) => setSelectedMonth(Number(e.target.value));
  const handleYearChange = (e) => setSelectedYear(Number(e.target.value));
  const handleDateChange = (e) => setSelectedDate(e.target.value);

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      {/* Bloque: Formulario de ventas */}
      <div className="bg-white rounded-lg shadow p-3 mb-4">
        <h2 className="text-base font-bold mb-2 text-green-700">Registrar venta</h2>
        {/* Selector de mes compacto */}
        <div className="flex justify-center gap-2 mb-2">
          <select value={selectedMonth} onChange={handleMonthChange} className="text-xs rounded border px-2 py-1">
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={handleYearChange} className="text-xs rounded border px-2 py-1">
            {[selectedYear-1, selectedYear, selectedYear+1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {/* Selector de fecha para registrar ventas en otra fecha */}
        <div className="flex justify-center gap-2 mb-3">
          <label className="text-xs font-semibold text-gray-700">Fecha del movimiento:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded px-2 py-1 text-xs"
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
        {/* Formulario de ventas (solo formulario) */}
        <MovementsView
          {...props}
          showOnlyForm={true}
          showOnlySalesOfDay={true}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedDate={selectedDate}
        />
      </div>
      {/* Bloque: Historial de ventas */}
      <div className="bg-white rounded-lg shadow p-3">
        <MovementsView
          {...props}
          hideForm={true}
          showOnlySalesOfDay={true}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </div>
  );
};

export default SalesMovilView;
