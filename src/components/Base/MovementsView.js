import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import PlantForm from './PlantForm';
import PlantAutocomplete from './PlantAutocomplete';
import { toZonedTime } from 'date-fns-tz';
import { registrarVenta } from './saleUtils';
import PropTypes from 'prop-types';

const MOVEMENT_TYPES = [
  { value: 'venta', label: 'Venta' },
  { value: 'compra', label: 'Compra' },
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'egreso', label: 'Egreso' }
];

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo (E)' },
  { value: 'mercadoPago', label: 'Mercado Pago (MP)' }
];

// Este componente se moverá a la carpeta Base
const MovementsView = ({ plants: propPlants, hideForm, showOnlyForm, renderTotals }) => {
  const [plants, setPlants] = useState(propPlants || []);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({
    type: 'venta',
    detail: '',
    plantId: '',
    quantity: 1,
    price: '',
    total: '',
    paymentMethod: 'efectivo',
    date: new Date().toISOString().slice(0, 16),
    location: '',
    notes: ''
  });
  const [showSuggestPlant, setShowSuggestPlant] = useState(false);
  const [suggestedPlantName, setSuggestedPlantName] = useState('');
  const [showPlantForm, setShowPlantForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [toastError, setToastError] = useState(false);

  // --- FILTRO MENSUAL ---
  const [reloadKey, setReloadKey] = useState(0);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const movementsThisMonth = movements.filter(mov => {
    if (!mov.date) return false;
    const d = new Date(mov.date);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'movements'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovements(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });
    return () => unsubscribe();
  }, [reloadKey]);

  useEffect(() => {
    // Siempre sincronizar plantas con inventario en tiempo real
    const unsubscribe = onSnapshot(collection(db, 'plants'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlants(data);
    });
    return () => unsubscribe();
  }, []);

  const handleReload = () => {
    setReloadKey(k => k + 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Calcular saldos actuales de caja antes del submit
  const cajaActualEfectivo = movements.filter(m => m.paymentMethod === 'efectivo').reduce((sum, m) => {
    if (m.type === 'venta' || m.type === 'ingreso') return sum + (Number(m.total) || 0);
    if (m.type === 'compra' || m.type === 'egreso') return sum - (Number(m.total) || 0);
    return sum;
  }, 0);
  const cajaActualMP = movements.filter(m => m.paymentMethod === 'mercadoPago').reduce((sum, m) => {
    if (m.type === 'venta' || m.type === 'ingreso') return sum + (Number(m.total) || 0);
    if (m.type === 'compra' || m.type === 'egreso') return sum - (Number(m.total) || 0);
    return sum;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    let total = form.total;
    let price = form.price;
    // Forzar siempre dos decimales exactos
    if ((form.type === 'venta' || form.type === 'compra')) {
      if (!total && form.price && form.quantity) {
        total = (Number(form.price) * Number(form.quantity)).toFixed(2);
      }
      price = Number(form.price).toFixed(2);
    } else {
      if (!total && form.price) {
        total = Number(form.price).toFixed(2);
      }
      price = form.price ? Number(form.price).toFixed(2) : '';
    }
    // Validaciones adicionales para ventas
    if (form.type === 'venta') {
      if (!form.price || Number(form.price) <= 0) {
        setErrorMsg('Debe ingresar un precio válido para la venta.');
        return;
      }
      if (!form.plantId) {
        setErrorMsg('Debe seleccionar un producto (planta, maceta u otro) para la venta.');
        return;
      }
    }
    // Validación de saldo suficiente para compras y egresos
    if ((form.type === 'compra' || form.type === 'egreso')) {
      const monto = Number(form.type === 'ingreso' || form.type === 'egreso' ? form.price : total);
      if (form.paymentMethod === 'mercadoPago' && monto > cajaActualMP) {
        setErrorMsg('No hay saldo suficiente en Mercado Pago para realizar esta operación.');
        showToast({ type: 'error', text: 'No hay saldo suficiente en Mercado Pago para realizar esta operación.' });
        setToastError(true);
        return;
      }
      if (form.paymentMethod === 'efectivo' && monto > cajaActualEfectivo) {
        setErrorMsg('No hay saldo suficiente en Efectivo para realizar esta operación.');
        showToast({ type: 'error', text: 'No hay saldo suficiente en Efectivo para realizar esta operación.' });
        setToastError(true);
        return;
      }
    }
    // Fecha: lógica según dispositivo y tipo
    let dateStr = form.date;
    let dateArg;
    if (form.type === 'venta' && isMobileDevice) {
      // En móvil y venta, la fecha es automática (ahora)
      const nowStr = new Date().toISOString().slice(0, 16);
      const zoned = toZonedTime(nowStr, 'America/Argentina/Buenos_Aires');
      dateArg = new Date(Date.UTC(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), zoned.getHours(), zoned.getMinutes()));
    } else if (dateStr && dateStr.length === 10) { // Solo fecha, sin hora
      const zoned = toZonedTime(dateStr + 'T00:00', 'America/Argentina/Buenos_Aires');
      dateArg = new Date(Date.UTC(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), zoned.getHours(), zoned.getMinutes()));
    } else if (dateStr && dateStr.length === 16) { // datetime-local (YYYY-MM-DDTHH:mm)
      const zoned = toZonedTime(dateStr, 'America/Argentina/Buenos_Aires');
      dateArg = new Date(Date.UTC(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), zoned.getHours(), zoned.getMinutes()));
    } else {
      const nowStr = new Date().toISOString().slice(0, 16);
      const zoned = toZonedTime(nowStr, 'America/Argentina/Buenos_Aires');
      dateArg = new Date(Date.UTC(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), zoned.getHours(), zoned.getMinutes()));
    }
    const isoArgentina = dateArg.toISOString();

    try {
      if (form.type === 'venta' || form.type === 'compra') {
        // Forzar que detail esté vacío en ventas y compras
        const movementData = {
          ...form,
          detail: '',
          total: Number(total),
          price: Number(price),
          date: isoArgentina
        };
        if (form.type === 'venta') {
          const result = await registrarVenta({
            plantId: form.plantId,
            quantity: form.quantity,
            price: Number(price),
            paymentMethod: form.paymentMethod,
            date: isoArgentina,
            location: form.location,
            notes: form.notes
          });
          if (!result.ok) {
            setErrorMsg(result.error || 'Error al registrar la venta');
            showToast({ type: 'error', text: result.error || 'Error al registrar la venta' });
            setToastError(true);
            return;
          } else {
            showToast({ type: 'success', text: 'Movimiento registrado correctamente' });
            setToastError(false);
          }
        } else {
          movementData.quantity = Number(form.quantity);
          movementData.price = Number(price);
          await addDoc(collection(db, 'movements'), movementData);
          showToast({ type: 'success', text: 'Movimiento registrado correctamente' });
          setToastError(false);
        }
      } else {
        let movementData = {
          ...form,
          total: Number(total),
          price: price ? Number(price) : undefined,
          date: isoArgentina
        };
        delete movementData.quantity;
        await addDoc(collection(db, 'movements'), movementData);
        showToast({ type: 'success', text: 'Movimiento registrado correctamente' });
        setToastError(false);
      }
      setForm({
        type: 'venta',
        detail: '',
        plantId: '',
        quantity: 1,
        price: '',
        total: '',
        paymentMethod: 'efectivo',
        date: new Date().toISOString().slice(0, 16),
        location: '',
        notes: ''
      });
    } catch (err) {
      setErrorMsg('Error al registrar el movimiento');
      showToast({ type: 'error', text: 'Error al registrar el movimiento' });
      setToastError(true);
    }
  };

  // --- FILTRO DEL DÍA (para móvil) ---
  const currentDay = now.getDate();
  const movementsToday = movements.filter(mov => {
    if (!mov.date) return false;
    const d = new Date(mov.date);
    if (isNaN(d.getTime())) return false;
    return d.getDate() === currentDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  // --- TOTALES DEL DÍA (para móvil) ---
  const totalVentasDia = movementsToday.filter(m => m.type === 'venta').reduce((sum, m) => sum + (m.total || 0), 0);
  const totalComprasDia = movementsToday.filter(m => m.type === 'compra').reduce((sum, m) => sum + (m.total || 0), 0);
  const totalEgresosEfectivoDia = movementsToday.filter(m => m.type === 'egreso' && m.paymentMethod === 'efectivo').reduce((sum, m) => sum + (m.total || 0), 0);
  const totalEgresosMPDia = movementsToday.filter(m => m.type === 'egreso' && m.paymentMethod === 'mercadoPago').reduce((sum, m) => sum + (m.total || 0), 0);
  const ventasEfectivoDia = movementsToday.filter(m => m.type === 'venta' && m.paymentMethod === 'efectivo').reduce((sum, m) => sum + (m.total || 0), 0);
  const ventasMPDia = movementsToday.filter(m => m.type === 'venta' && m.paymentMethod === 'mercadoPago').reduce((sum, m) => sum + (m.total || 0), 0);
  const comprasEfectivoDia = movementsToday.filter(m => m.type === 'compra' && m.paymentMethod === 'efectivo').reduce((sum, m) => sum + (m.total || 0), 0);
  const comprasMPDia = movementsToday.filter(m => m.type === 'compra' && m.paymentMethod === 'mercadoPago').reduce((sum, m) => sum + (m.total || 0), 0);
  const ingresosEfectivoDia = movementsToday.filter(m => m.type === 'ingreso' && m.paymentMethod === 'efectivo').reduce((sum, m) => sum + (m.total || 0), 0);
  const ingresosMPDia = movementsToday.filter(m => m.type === 'ingreso' && m.paymentMethod === 'mercadoPago').reduce((sum, m) => sum + (m.total || 0), 0);
  // Ahora restamos compras y egresos
  const cajaFisicaDia = ingresosEfectivoDia + ventasEfectivoDia - comprasEfectivoDia - totalEgresosEfectivoDia;
  const cajaMPDia = ingresosMPDia + ventasMPDia - comprasMPDia - totalEgresosMPDia;
  const totalGeneralDia = cajaFisicaDia + cajaMPDia;
  // Cantidad total de productos vendidos en el día
  const cantidadProductosVendidosDia = movementsToday.filter(m => m.type === 'venta').reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobileDevice = isMobile;

  // --- BLOQUE DE TOTALES DIARIOS PARA MÓVIL ---
  const TotalsBlock = () => (
    <div className="mb-4">
      <div className="flex flex-col gap-2 text-center">
        <div className="font-bold text-lg text-gray-800">Totales del Día</div>
        <div className="flex flex-row justify-center gap-4">
          <div className="bg-green-100 rounded px-3 py-1">
            <div className="text-xs text-gray-600">Efectivo</div>
            <div className="font-semibold text-green-700">${cajaFisicaDia.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
          </div>
          <div className="bg-blue-100 rounded px-3 py-1">
            <div className="text-xs text-gray-600">Mercado Pago</div>
            <div className="font-semibold text-blue-700">${cajaMPDia.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
          </div>
          <div className="bg-yellow-100 rounded px-3 py-1">
            <div className="text-xs text-gray-600">Total</div>
            <div className="font-semibold text-yellow-700">${totalGeneralDia.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select name="type" value={form.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            {MOVEMENT_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Detalle</label>
          <input 
            name="detail" 
            value={form.type === 'venta' ? '' : form.detail}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={form.type === 'venta'}
            placeholder={form.type === 'venta' ? 'Solo para ingresos/egresos/compras' : ''}
          />
        </div>
        {/* Producto solo para venta y compra */}
        {(form.type === 'venta' || form.type === 'compra') && (
          <div>
            <PlantAutocomplete
              plants={plants}
              value={form.plantId ? String(form.plantId) : ''}
              onChange={val => {
                // Solo guardar si es un id válido
                if (val && plants.some(p => String(p.id) === String(val))) {
                  setForm(f => ({ ...f, plantId: String(val) }));
                } else {
                  setForm(f => ({ ...f, plantId: '' }));
                }
                setShowSuggestPlant(false);
                setSuggestedPlantName('');
              }}
              onBlur={() => {
                setShowSuggestPlant(false);
                setSuggestedPlantName('');
              }}
              onSelect={() => {
                setShowSuggestPlant(false);
                setSuggestedPlantName('');
                setTimeout(() => {
                  const el = document.activeElement;
                  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }, 100);
              }}
              required={form.type === 'venta'}
              label="Producto"
              disabled={form.type !== 'venta' && form.type !== 'compra'}
            />
          </div>
        )}
        {/* Cantidad solo para venta, o para compra si hay producto seleccionado */}
        {((form.type === 'venta') || (form.type === 'compra' && form.plantId)) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
            <input type="number" name="quantity" min="1" value={form.quantity} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        )}
        {/* Para ingreso y egreso, cantidad y producto deshabilitados/no renderizados */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Precio</label>
          <input type="number" name="price" min="0" value={form.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total</label>
          <input type="number" name="total" min="0" value={form.type === 'ingreso' || form.type === 'egreso' ? form.price : form.total} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Se calcula automáticamente" disabled={form.type === 'ingreso' || form.type === 'egreso'} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            {PAYMENT_METHODS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        {/* Fecha: solo editable si no es móvil y es venta, siempre editable para otros movimientos */}
        {((form.type !== 'venta') || !isMobileDevice) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" name="date" value={form.date?.slice(0,10) || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Lugar</label>
          <input name="location" value={form.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notas</label>
          <input name="notes" value={form.notes} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
      </div>
      <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Registrar Movimiento</button>
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">{errorMsg}</div>
      )}
      {showSuggestPlant && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mb-4">
          <p className="mb-2">¿Deseas agregar <b>{suggestedPlantName}</b> como nuevo producto al inventario?</p>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
            onClick={() => { setShowPlantForm(true); setShowSuggestPlant(false); }}
          >
            Sí, agregar producto
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={() => setShowSuggestPlant(false)}
          >
            No, gracias
          </button>
        </div>
      )}
      {showPlantForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="text-lg font-bold mb-2">Nuevo Producto</h3>
          <PlantForm
            initialData={{ name: suggestedPlantName, basePrice: '', purchasePrice: '', stock: '', type: 'interior' }}
            onSubmit={() => { setShowPlantForm(false); }}
            onCancel={() => setShowPlantForm(false)}
          />
        </div>
      )}
    </form>
  );

  // Eliminar todos los movimientos del mes actual
  const handleDeleteMonthMovements = async () => {
    if (!window.confirm('¿Seguro que quieres borrar TODOS los movimientos de caja de este mes? Esta acción no se puede deshacer.')) return;
    const month = now.getMonth();
    const year = now.getFullYear();
    const toDelete = movements.filter(mov => {
      if (!mov.date) return false;
      const d = new Date(mov.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    for (const mov of toDelete) {
      await deleteDoc(doc(db, 'movements', mov.id));
    }
    handleReload();
    alert('Movimientos del mes eliminados.');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastError(msg.type === 'error');
    if (msg.type === 'success') {
      // Scroll al top en móvil
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setToastMsg(null), 4000); // 4 segundos
    }
  };

  // Limpiar plantId si el tipo de movimiento deja de ser venta o compra
  useEffect(() => {
    if (form.type !== 'venta' && form.type !== 'compra' && form.plantId) {
      setForm(f => ({ ...f, plantId: '' }));
    }
  }, [form.type]);

  // DEBUG: Log para ver qué valor se guarda al seleccionar producto
  // useEffect(() => {
  //   if (form.plantId) {
  //     const selected = plants.find(p => String(p.id) === String(form.plantId));
  //     console.log('DEBUG plantId:', form.plantId, 'selected:', selected);
  //   }
  // }, [form.plantId, plants]);

  if (showOnlyForm) {
    // Solo mostrar el formulario de carga de caja
    return (
      <div className="space-y-6">
        {/* Renderiza totales y movimientosToday si corresponde (móvil y prop presente) */}
        {isMobileDevice && typeof renderTotals === 'function' && renderTotals({
          cajaFisicaDia,
          cajaMPDia,
          totalGeneralDia,
          ventasEfectivoDia,
          ventasMPDia,
          totalVentasDia,
          totalComprasDia,
          cantidadProductosVendidosDia,
          movementsToday // <-- agregar para exponer los movimientos del día
        })}
        {/* Renderiza solo el formulario de movimientos (compra, venta, ingreso, egreso) */}
        {renderForm()}
      </div>
    );
  }
  if (hideForm) {
    // Solo mostrar la tabla/lista de movimientos, sin formulario
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center mb-4 w-full">
          <div className="w-full max-w-xl bg-gradient-to-br from-pink-100 via-white to-pink-200 rounded-lg shadow border border-pink-300 py-4 px-3">
            <h2 className="text-2xl font-black text-black text-center tracking-wide mb-1 font-sans">
              Movimientos de Caja
            </h2>
            <h3 className="text-lg font-bold text-pink-700 text-center uppercase tracking-wider mb-2">
              Ventas Diarias
            </h3>
            <hr className="border-t-2 border-pink-400 w-1/2 mx-auto my-2" />
          </div>
          <div className="w-full max-w-xl flex flex-row justify-between items-center mt-2">
            <button onClick={handleReload} className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 font-semibold">
              Recargar
            </button>
            <div className="text-base text-green-700 font-bold px-2 border-2 border-purple-300 rounded-lg bg-white shadow-sm">
              {now.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        {/* Tabla de movimientos del mes */}
        {movementsThisMonth.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No hay movimientos registrados este mes.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1">Fecha</th>
                <th className="px-2 py-1">Tipo</th>
                <th className="px-2 py-1">Detalle</th>
                <th className="px-2 py-1">Producto</th>
                <th className="px-2 py-1">Cantidad</th>
                <th className="px-2 py-1">Precio</th>
                <th className="px-2 py-1">Total</th>
                <th className="px-2 py-1">Método</th>
                <th className="px-2 py-1">Lugar</th>
                <th className="px-2 py-1">Notas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movementsThisMonth.map((mov, idx) => (
                <tr key={mov.id || idx} className={mov.type === 'compra' ? 'bg-red-50' : mov.type === 'egreso' ? 'bg-yellow-50' : mov.type === 'ingreso' ? 'bg-green-50' : ''}>
                  <td className="px-2 py-1">{mov.date ? new Date(mov.date).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-1">{mov.type}</td>
                  <td className="px-2 py-1">{(mov.type === 'venta' || mov.type === 'compra') ? '' : mov.detail}</td>
                  <td className="px-2 py-1">{(mov.type === 'venta' || mov.type === 'compra') ? (plants.find(p => p.id === Number(mov.plantId))?.name || mov.detail || '-') : '-'}</td>
                  <td className="px-2 py-1 text-right">{(mov.type === 'venta' || mov.type === 'compra') ? mov.quantity : ''}</td>
                  <td className="px-2 py-1 text-right">{mov.price ? `$${mov.price}` : ''}</td>
                  <td className="px-2 py-1 text-right">{mov.total ? `$${mov.total}` : ''}</td>
                  <td className="px-2 py-1">{mov.paymentMethod}</td>
                  <td className="px-2 py-1">{mov.location}</td>
                  <td className="px-2 py-1">{mov.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // --- TOTALES DEL MES ---
  // (Ocultamos todos los totales y resúmenes automáticos, solo mostramos el formulario y la tabla de movimientos)

  // Render sugerencia de alta de planta
  return (
    <div className="space-y-6">
      {toastMsg && (
        toastMsg.type === 'success' ? (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white text-center transition-all duration-300 bg-green-600 animate-slide-down" style={{marginBottom: 64}}>
            {toastMsg.text}
          </div>
        ) : (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white text-center transition-all duration-300 bg-red-600 flex flex-col items-center gap-2 animate-slide-down" style={{marginBottom: 64}}>
            <span>{toastMsg.text}</span>
            <button className="mt-1 px-3 py-1 bg-white text-red-700 rounded font-semibold border border-red-300 hover:bg-red-50" onClick={() => setToastMsg(null)}>Aceptar</button>
          </div>
        )
      )}
      <div className="flex flex-col items-center mb-4 w-full">
        <div className="w-full max-w-xl bg-gradient-to-br from-pink-100 via-white to-pink-200 rounded-lg shadow border border-pink-300 py-4 px-3">
          <h2 className="text-2xl font-black text-black text-center tracking-wide mb-1 font-sans">
            Movimientos de Caja
          </h2>
          <h3 className="text-lg font-bold text-pink-700 text-center uppercase tracking-wider mb-2">
            Ventas Diarias
          </h3>
          <hr className="border-t-2 border-pink-400 w-1/2 mx-auto my-2" />
        </div>
        <div className="w-full max-w-xl flex flex-row justify-between items-center mt-2">
          <button onClick={handleReload} className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 font-semibold">
            Recargar
          </button>
          <div className="text-base text-green-700 font-bold px-2 border-2 border-purple-300 rounded-lg bg-white shadow-sm">
            {now.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
      {/* Solo formulario y tabla, sin totales ni resúmenes */}
      {!hideForm && renderForm()}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Histórico de Movimientos del Mes</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          {movementsThisMonth.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No hay movimientos registrados este mes.</div>
          ) : (
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1">Fecha</th>
                <th className="px-2 py-1">Tipo</th>
                <th className="px-2 py-1">Detalle</th>
                <th className="px-2 py-1">Producto</th>
                <th className="px-2 py-1">Cantidad</th>
                <th className="px-2 py-1">Precio</th>
                <th className="px-2 py-1">Total</th>
                <th className="px-2 py-1">Método</th>
                <th className="px-2 py-1">Lugar</th>
                <th className="px-2 py-1">Notas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movementsThisMonth.map(mov => (
                <tr key={mov.id} className={mov.type === 'compra' ? 'bg-red-50' : mov.type === 'egreso' ? 'bg-yellow-50' : mov.type === 'ingreso' ? 'bg-green-50' : ''}>
                  <td className="px-2 py-1">{mov.date ? new Date(mov.date).toLocaleString('es-AR', {
                    timeZone: 'America/Argentina/Buenos_Aires',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : ''}</td>
                  <td className="px-2 py-1">{MOVEMENT_TYPES.find(t => t.value === mov.type)?.label || mov.type}</td>
                  <td className="px-2 py-1">{mov.type === 'venta' ? '' : mov.detail}</td>
                  <td className="px-2 py-1">{mov.type === 'venta' ? (plants.find(p => p.id === Number(mov.plantId))?.name || mov.detail || '-') : '-'}</td>
                  <td className="px-2 py-1 text-right">
                    {(mov.type === 'venta' || mov.type === 'compra') ? mov.quantity : ''}
                  </td>
                  <td className="px-2 py-1 text-right">{mov.price ? `$${mov.price}` : ''}</td>
                  <td className="px-2 py-1 text-right">{mov.total ? `$${mov.total}` : ''}</td>
                  <td className="px-2 py-1">{PAYMENT_METHODS.find(m => m.value === mov.paymentMethod)?.label || mov.paymentMethod}</td>
                  <td className="px-2 py-1">{mov.location}</td>
                  <td className="px-2 py-1">{mov.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

MovementsView.propTypes = {
  plants: PropTypes.array,
  hideForm: PropTypes.bool,
  showOnlyForm: PropTypes.bool,
  renderTotals: PropTypes.func,
};

export default MovementsView;

// NOTA: El campo 'date' almacena fecha y hora completa en formato ISO. Si en el futuro se requiere un reporte o gráfico por horario de ventas, se puede usar new Date(mov.date).getHours() para agrupar por hora.
// En la sección de caja solo se muestra la fecha (día/mes/año) para mayor simplicidad visual.

/*
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-32px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slide-down {
  animation: slideDown 0.4s cubic-bezier(0.4,0,0.2,1);
}
*/
