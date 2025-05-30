const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            {product.type}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-gray-500">Precio venta</p>
            <p className="font-medium">${product.basePrice}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stock</p>
            <p className="font-medium">{product.stock} unidades</p>
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={() => onEdit(product)}
            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            Editar
          </button>
          <button 
            onClick={() => onDelete(product.id)}
            className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};