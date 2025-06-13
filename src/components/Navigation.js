import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../App';

const Navigation = ({ currentView, setCurrentView, sidebarMode, userData: userDataProp }) => {
  const context = useContext(UserContext);
  const userData = userDataProp || (context && context.userData);

  // Mostrar loader si userData aún no está disponible pero el usuario está logueado
  if (userData === null && context && context.user) {
    return <div className="text-gray-400 p-4">Cargando menú...</div>;
  }

  const views = [
    { id: 'plants', label: 'Productos', icon: '📦' },
    { id: 'movements', label: 'Caja', icon: '💼' },
    { id: 'stats', label: 'Estadísticas', icon: '📊' },
    { id: 'reportes', label: 'Reportes', icon: '📈' },
    { id: 'carga-movil', label: 'Carga Móvil', icon: '📲', mobileOnly: true }
  ];
  const adminView = { id: 'admin', label: 'Administración', icon: '🛠️', adminOnly: true };
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // --- Sidebar para escritorio ---
  if (!isMobile && sidebarMode) {
    // DEBUG: Mostrar el rol actual arriba del menú
    return (
      <nav className="flex flex-col gap-2 mt-4">
        {userData && (
          <div className="text-xs text-gray-500 mb-2">Rol: <b>{userData.rol || 'sin rol'}</b></div>
        )}
        {views.filter(view => !view.mobileOnly).map(view => (
          <button
            key={view.id}
            onClick={() => setCurrentView(view.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-semibold transition w-full text-left
              ${currentView === view.id
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'}`}
            title={view.label}
          >
            <span className="text-2xl">{view.icon}</span>
            {sidebarMode === 'full' && <span className="text-base font-medium">{view.label}</span>}
          </button>
        ))}
        {/* Opción de administración solo para admin/dios */}
        {userData && (userData.rol === 'admin' || userData.rol === 'dios') && (
          <button
            key={adminView.id}
            onClick={() => setCurrentView(adminView.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-semibold transition w-full text-left
              ${currentView === adminView.id
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'}`}
            title={adminView.label}
          >
            <span className="text-2xl">{adminView.icon}</span>
            {sidebarMode === 'full' && <span className="text-base font-medium">{adminView.label}</span>}
          </button>
        )}
      </nav>
    );
  }

  // --- Barra superior moderna con íconos y feedback SOLO para escritorio (sin sidebar) ---
  if (!isMobile) {
    return (
      <nav className="bg-white shadow rounded-xl px-4 py-2 flex items-center gap-2 mb-6">
        {views.filter(view => !view.mobileOnly).map(view => (
          <button
            key={view.id}
            onClick={() => setCurrentView(view.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition
              ${currentView === view.id
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'}`}
          >
            <span className="text-xl">{view.icon}</span>
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  // --- Variante original para móvil ---
  return (
    <nav className="bg-white shadow-sm rounded-lg overflow-hidden">
      <ul className="flex divide-x divide-gray-200 overflow-x-auto">
        {views
          .filter(view => isMobile ? (view.mobileOnly || view.id === 'carga-movil' || view.id === 'plants' || view.id === 'movements') : view.id !== 'carga-movil' || view.mobileOnly)
          .map(view => (
            <li key={view.id} className="flex-1 min-w-[80px]">
              <button
                onClick={() => setCurrentView(view.id)}
                className={`w-full py-3 px-4 text-center font-medium ${currentView === view.id ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="block text-lg">{view.icon}</span>
                <span>{view.label}</span>
              </button>
            </li>
          ))}
      </ul>
    </nav>
  );
};

Navigation.propTypes = {
  currentView: PropTypes.string.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  sidebarMode: PropTypes.string,
  userData: PropTypes.object // Puede ser null o un objeto de usuario
};

export default Navigation;