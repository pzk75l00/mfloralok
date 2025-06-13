import React, { useState } from 'react';
import { deleteAllPlants, uploadPlants } from '../../utils/plantsFirestore';
import plantsData from '../../mock/plants_full.json';

const LoadPlantsToFirestore = () => {
  const [loading, setLoading] = useState(false);
  const handleLoad = async () => {
    setLoading(true);
    try {
      await deleteAllPlants();
      await uploadPlants(plantsData);
      alert('¡Plantas actualizadas en Firestore! Si no ves los cambios, recarga la página.');
    } catch (err) {
      alert('Error al actualizar plantas en Firestore: ' + err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleLoad}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? 'Actualizando...' : 'Actualizar plantas en Firestore'}
      </button>
    </div>
  );
};

// Este componente ya no es necesario en la UI principal. Puede eliminarse o dejarse solo para uso técnico/manual.
// export default LoadPlantsToFirestore;