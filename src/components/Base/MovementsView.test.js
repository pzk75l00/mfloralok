import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MovementsView from './MovementsView';

// Mock de dependencias externas
jest.mock('../../firebase/firebaseConfig', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  onSnapshot: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({ stock: 10 }) }))
}));

const mockPlants = [
  { id: '1', name: 'Rosa', stock: 10, basePrice: 100, purchasePrice: 80 },
  { id: '2', name: 'Tulipán', stock: 5, basePrice: 120, purchasePrice: 90 }
];

describe('MovementsView', () => {
  it('renderiza el formulario de movimiento', () => {
    render(<MovementsView plants={mockPlants} />);
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cantidad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pago/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lugar/i)).toBeInTheDocument();
  });

  it('muestra error si se intenta registrar venta sin producto', async () => {
    render(<MovementsView plants={mockPlants} />);
    fireEvent.click(screen.getByText(/Registrar Venta/i));
    await waitFor(() => {
      expect(screen.getByText(/Agregue al menos un producto/i)).toBeInTheDocument();
    });
  });

  it('permite agregar un producto y muestra el total', async () => {
    render(<MovementsView plants={mockPlants} />);
    // Seleccionar producto
    fireEvent.change(screen.getByLabelText(/Producto/i).closest('div').querySelector('select'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Cantidad/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: '150' } });
    fireEvent.click(screen.getByText(/Agregar/i));
    expect(screen.getByText(/Total: \$300/i)).toBeInTheDocument();
  });
});
