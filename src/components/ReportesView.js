import React, { useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const ReportesView = ({ plants, sales, purchases }) => {
  // --- Ventas y compras por mes ---
  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('es-AR', { month: 'short' }));
  const salesByMonth = Array(12).fill(0);
  const purchasesByMonth = Array(12).fill(0);

  sales.forEach(sale => {
    if (!sale.date) return;
    const d = new Date(sale.date);
    salesByMonth[d.getMonth()] += sale.total || 0;
  });
  purchases.forEach(purchase => {
    if (!purchase.date) return;
    const d = new Date(purchase.date);
    purchasesByMonth[d.getMonth()] += (purchase.purchasePrice * purchase.quantity) || 0;
  });

  // --- Stock por tipo de planta ---
  const stockByType = {};
  plants.forEach(plant => {
    stockByType[plant.type] = (stockByType[plant.type] || 0) + (plant.stock || 0);
  });
  const typeLabels = Object.keys(stockByType);
  const typeData = Object.values(stockByType);

  // --- Ranking de plantas por lugar ---
  const [selectedLocation, setSelectedLocation] = useState('');
  // Obtener todos los lugares únicos
  const locations = Array.from(new Set(sales.map(s => s.location).filter(Boolean)));
  // Filtrar ventas por lugar seleccionado
  const salesByLocation = selectedLocation
    ? sales.filter(s => s.location === selectedLocation)
    : sales;
  // Contar ventas por planta en ese lugar
  const plantSalesCount = {};
  salesByLocation.forEach(sale => {
    if (!sale.plantId) return;
    plantSalesCount[sale.plantId] = (plantSalesCount[sale.plantId] || 0) + (sale.quantity || 0);
  });
  // Top plantas vendidas en ese lugar
  const topPlantSales = Object.entries(plantSalesCount)
    .map(([plantId, qty]) => ({
      name: plants.find(p => p.id === Number(plantId))?.name || 'Planta eliminada',
      qty
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Reportes y Gráficos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Ventas vs Compras por Mes</h3>
            <Bar
              data={{
                labels: months,
                datasets: [
                  { label: 'Ventas', data: salesByMonth, backgroundColor: 'rgba(34,197,94,0.7)' },
                  { label: 'Compras', data: purchasesByMonth, backgroundColor: 'rgba(239,68,68,0.7)' }
                ]
              }}
              options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Stock por Tipo de Planta</h3>
            <Pie
              data={{
                labels: typeLabels,
                datasets: [
                  { data: typeData, backgroundColor: ['#22c55e', '#f59e42', '#38bdf8', '#a78bfa', '#f43f5e'] }
                ]
              }}
              options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
            <h3 className="font-semibold mb-2">Evolución de Ventas Mensuales</h3>
            <Line
              data={{
                labels: months,
                datasets: [
                  { label: 'Ventas', data: salesByMonth, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', fill: true }
                ]
              }}
              options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
            <h3 className="font-semibold mb-2">Plantas más vendidas por lugar</h3>
            <div className="flex items-center gap-2 mb-4">
              <label className="font-medium">Lugar:</label>
              <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="border rounded px-2 py-1">
                <option value="">Todos</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {topPlantSales.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-1">Planta</th>
                    <th className="text-right px-2 py-1">Cantidad vendida</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlantSales.map((item, idx) => (
                    <tr key={item.name} className={idx === 0 ? 'font-bold text-green-700' : ''}>
                      <td className="px-2 py-1">{item.name}</td>
                      <td className="px-2 py-1 text-right">{item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No hay ventas registradas en este lugar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesView;
