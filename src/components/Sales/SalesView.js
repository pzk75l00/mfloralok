import React, { useState, useEffect } from 'react';
import SalesMovilView from '../Movil/SalesMovilView';
import MovementsView from '../Base/MovementsView';

// Vista principal de Ventas: detecta dispositivo y muestra la vista adecuada
const SalesView = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if (isMobile) return <SalesMovilView {...props} />;

  // Vista de escritorio: puedes personalizar MovementsView para ventas
  return (
    <div className="relative max-w-full">
      <h2 className="text-xl font-bold mb-4">Ventas</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <MovementsView {...props} showOnlySalesOfDay={false} />
      </div>
    </div>
  );
};

export default SalesView;
