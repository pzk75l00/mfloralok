import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
// import getNow from '../../utils/mockDate'; // Eliminar mock
import MovementsView from '../Base/MovementsView';
import PropTypes from 'prop-types';

// Vista móvil para Caja: muestra totales del día y formulario
const CashMovilView = (props) => {
  // --- BLOQUE SUTIL DE COMPRAS/EGRESOS DEL DÍA ---
  const [comprasEgresosHoy, setComprasEgresosHoy] = useState([]);
  // --- Estado para selector de mes ---
  const initialNow = new Date(); // Usar fecha real
  const [now, setNow] = useState(initialNow);
  const [selectedMonth, setSelectedMonth] = useState(initialNow.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialNow.getFullYear());
  const [movements, setMovements] = useState([]);
  const [plants, setPlants] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setNow(new Date()); // Actualiza la fecha real cada vez que recargamos movimientos
    // Suscribirse a movimientos y filtrar compras/egresos del día
    const unsubscribe = onSnapshot(collection(db, 'movements'), (snapshot) => {
      const movimientos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovements(movimientos);
      const nowValue = new Date(); // Usar fecha real
      const currentDay = nowValue.getDate();
      const currentMonth = nowValue.getMonth();
      const currentYear = nowValue.getFullYear();
      const comprasEgresos = movimientos.filter(m => {
        if (!m.date) return false;
        const d = new Date(m.date);
        if (isNaN(d.getTime())) return false;
        return (m.type === 'compra' || m.type === 'egreso') &&
          d.getDate() === currentDay &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear;
      });
      setComprasEgresosHoy(comprasEgresos);
    });
    const unsubPlants = onSnapshot(collection(db, 'plants'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlants(data);
    });
    return () => {
      unsubscribe();
      unsubPlants();
    };
  }, [reloadKey]);

  // --- Lógica para filtrar movimientos del mes seleccionado ---
  const movementsThisMonth = movements.filter(mov => {
    if (!mov.date) return false;
    const d = new Date(mov.date);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
  // --- Lógica para filtrar movimientos del día actual (solo si mes/año actual) ---
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  const currentDay = now.getDate();
  const movementsToday = isCurrentMonth
    ? movementsThisMonth.filter(mov => {
        const d = new Date(mov.date);
        return d.getDate() === currentDay;
      })
    : [];

  // --- Totales del mes o del día ---
  const calcTotals = (movs) => {
    const ventasEfectivo = movs.filter(m => m.type === 'venta' && m.paymentMethod === 'efectivo').reduce((sum, m) => sum + (Number(m.total) || 0), 0);
    const ventasMP = movs.filter(m => m.type === 'venta' && m.paymentMethod === 'mercadoPago').reduce((sum, m) => sum + (Number(m.total) || 0), 0);
    const comprasEfectivo = movs.filter(m => m.type === 'compra' && m.paymentMethod === 'efectivo').reduce((sum, m) => sum + (Number(m.total) || 0), 0);
    const comprasMP = movs.filter(m => m.type === 'compra' && m.paymentMethod === 'mercadoPago').reduce((sum, m) => sum + (Number(m.total) || 0), 0);
    const ingresosEfectivo = movs.filter(m => m.type === 'ingreso' && m.paymentMethod === 'efectivo').reduce((sum, m) => sum + (Number(m.total) || 0), 0);
    const ingresosMP = movs.filter(m => m.type === 'ingreso' && m.paymentMethod === 'mercadoPago').reduce((sum, m) => sum + (Number(m.total) || 0), 0);
    const egresosEfectivo = movs.filter(m => m.type === 'egreso' && m.paymentMethod === 'efectivo').reduce((sum, m) => sum + (Number(m.total) || 0), 0);
    const egresosMP = movs.filter(m => m.type === 'egreso' && m.paymentMethod === 'mercadoPago').reduce((sum, m) => sum + (Number(m.total) || 0), 0);
    const cajaFisica = ingresosEfectivo + ventasEfectivo - comprasEfectivo - egresosEfectivo;
    const cajaMP = ingresosMP + ventasMP - comprasMP - egresosMP;
    const totalGeneral = cajaFisica + cajaMP;
    const cantidadProductosVendidos = movs.filter(m => m.type === 'venta').reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
    return {
      cajaFisica,
      cajaMP,
      totalGeneral,
      cantidadProductosVendidos,
      ventasEfectivo,
      ventasMP,
      comprasEfectivo,
      comprasMP,
      ingresosEfectivo,
      ingresosMP,
      egresosEfectivo,
      egresosMP
    };
  };

  // --- Panel superior dinámico ---
  const showDayTotals = isCurrentMonth && movementsToday.length > 0;
  const totals = showDayTotals ? calcTotals(movementsToday) : calcTotals(movementsThisMonth);

  // Forzar recarga de movimientos tras registrar uno nuevo
  const handleMovementAdded = (...args) => {
    console.log('[CashMovilView] Movimiento registrado. Args:', args, 'Fecha:', new Date());
    setReloadKey(k => k + 1);
    setNow(new Date()); // Fuerza actualización de la fecha real
  };

  // Determinar color según lugar
  const lugar = props.lugar || props.location || '';
  const colorMap = {
    'sucursal': { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700' },
    'deposito': { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700' },
    'online': { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700' },
    // Agregar más lugares y colores si es necesario
    '': { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700' } // default
  };
  const color = colorMap[lugar] || colorMap[''];

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      <div className="rounded-lg shadow bg-white p-3">
        {/* Panel superior dinámico */}
        <div className={`w-full max-w-xl mx-auto flex flex-wrap gap-2 sm:gap-4 justify-center mb-2`}>
          <div className={`flex-1 min-w-[110px] rounded-lg shadow p-2 sm:p-4 flex flex-col items-center border ${showDayTotals ? 'bg-green-100 border-green-300' : 'bg-blue-50 border-blue-200'}`}> 
            <span className={`text-xs sm:text-sm ${showDayTotals ? 'text-green-700' : 'text-blue-700'}`}>{showDayTotals ? 'Efectivo' : 'Saldo Efectivo'}</span>
            <span className={`text-lg sm:text-2xl font-bold ${showDayTotals ? 'text-green-700' : 'text-blue-700'} truncate`}>
              ${totals.cajaFisica.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`flex-1 min-w-[110px] rounded-lg shadow p-2 sm:p-4 flex flex-col items-center border ${showDayTotals ? 'bg-blue-100 border-blue-300' : 'bg-purple-50 border-purple-200'}`}> 
            <span className={`text-xs sm:text-sm ${showDayTotals ? 'text-blue-700' : 'text-purple-700'}`}>{showDayTotals ? 'Mercado Pago' : 'Saldo MP'}</span>
            <span className={`text-lg sm:text-2xl font-bold ${showDayTotals ? 'text-blue-700' : 'text-purple-700'} truncate`}>
              ${totals.cajaMP.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`flex-1 min-w-[110px] rounded-lg shadow p-2 sm:p-4 flex flex-col items-center border ${showDayTotals ? 'bg-yellow-100 border-yellow-300' : 'bg-yellow-50 border-yellow-200'}`}> 
            <span className={`text-xs sm:text-sm ${showDayTotals ? 'text-yellow-700' : 'text-yellow-700'}`}>{showDayTotals ? 'Total' : 'Saldo Total'}</span>
            <span className={`text-lg sm:text-2xl font-bold text-yellow-700 truncate`}>
              ${totals.totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        {/* Leyenda visual */}
        <div className="text-center text-xs mb-2">
          {showDayTotals
            ? <span className="text-green-700 font-semibold">Totales del día actual</span>
            : <span className="text-blue-700 font-semibold">Saldo disponible actualizado</span>
          }
        </div>
        {/* Productos vendidos */}
        <div className="mt-2 w-full max-w-xl mx-auto flex flex-row gap-4 justify-center">
          <div className="flex-1 bg-purple-100 rounded-lg shadow p-4 flex flex-col items-center border border-purple-300">
            <span className="text-gray-500 text-sm">{showDayTotals ? 'Artículos vendidos hoy' : 'Artículos vendidos en el mes'}</span>
            <span className="text-2xl font-bold text-purple-700">
              {totals.cantidadProductosVendidos}
            </span>
          </div>
        </div>
        {/* Formulario y totales, sin historial de movimientos */}
        <MovementsView
          {...props}
          showOnlyForm={true}
          renderTotals={null}
          onMovementAdded={handleMovementAdded}
        />
        {/* Bloque sutil de compras y egresos del día, solo si es el mes actual */}
        {isCurrentMonth && (
          <div className="mt-8 w-full max-w-xl mx-auto">
            {comprasEgresosHoy.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 shadow-sm p-2 mt-2">
                <div className="text-xs font-semibold text-red-700 mb-2 text-center">Compras, egresos y gastos de hoy</div>
                <ul className="divide-y divide-red-100">
                  <li className="flex flex-row items-center justify-between px-1 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded mb-1">
                    <span className="w-14 text-left">Tipo</span>
                    <span className="flex-1 px-2 text-left">Producto/Detalle</span>
                    <span className="w-20 text-center">Precio</span>
                    <span className="w-14 text-center">Método</span>
                    <span className="max-w-[80px] text-left">Lugar</span>
                  </li>
                  {comprasEgresosHoy.map((m, idx) => {
                    let productoDetalle = '-';
                    if (m.type === 'compra') {
                      if (Array.isArray(m.products) && m.products.length > 0) {
                        productoDetalle = m.products.map(p => p.name).join(', ');
                      } else if (m.plantName) {
                        productoDetalle = m.plantName;
                      } else if (m.plantId && Array.isArray(plants) && plants.length > 0) {
                        const plant = plants.find(p => String(p.id) === String(m.plantId));
                        productoDetalle = plant ? plant.name : (m.detail || m.notes || '-');
                      } else {
                        productoDetalle = m.detail || m.notes || '-';
                      }
                    } else {
                      productoDetalle = m.detail || m.notes || '-';
                    }
                    return (
                      <li key={m.id || idx} className="flex flex-row items-center justify-between px-1 py-1 text-xs">
                        <span className="text-gray-700 w-14 text-left">{m.type ? m.type.charAt(0).toUpperCase() + m.type.slice(1) : '-'}</span>
                        <span className="text-gray-600 flex-1 px-2 truncate text-left">{productoDetalle}</span>
                        <span className="font-semibold text-red-700 w-20 text-center">${m.total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        <span className="text-gray-700 w-14 text-center">{m.paymentMethod === 'efectivo' ? 'Efectivo' : m.paymentMethod === 'mercadoPago' ? 'MP' : '-'}</span>
                        <span className="text-gray-500 max-w-[80px] truncate text-left ml-2">{m.location || '-'}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

CashMovilView.propTypes = {
  lugar: PropTypes.string,
  location: PropTypes.string,
};

export default CashMovilView;
