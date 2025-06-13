import React, { useState, useEffect } from 'react';
import MovementsView from '../Base/MovementsView';
import CashMovilView from '../Movil/CashMovilView';

// Caja y movimientos (usa el formulario avanzado y la tabla de movimientos)
const CashView = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if (isMobile) return <CashMovilView {...props} />;
  return (
    <div className="max-w-full mx-auto px-6 space-y-8">
      {/* Elimino el div sticky vacío para que MovementsView quede pegado arriba */}
      <MovementsView {...props} />
    </div>
  );
};

export default CashView;
