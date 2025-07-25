import React, { useState, useMemo, useCallback, memo } from 'react';

// Ejemplo 1: useMemo para cálculos costosos
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  inStock: boolean;
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop Gaming', price: 1200, category: 'Electronics', rating: 4.5, inStock: true },
  { id: 2, name: 'Mouse Inalámbrico', price: 50, category: 'Electronics', rating: 4.0, inStock: true },
  { id: 3, name: 'Teclado Mecánico', price: 120, category: 'Electronics', rating: 4.8, inStock: false },
  { id: 4, name: 'Monitor 4K', price: 400, category: 'Electronics', rating: 4.3, inStock: true },
  { id: 5, name: 'Auriculares', price: 80, category: 'Electronics', rating: 4.2, inStock: true },
  { id: 6, name: 'Camiseta', price: 25, category: 'Clothing', rating: 3.8, inStock: true },
  { id: 7, name: 'Jeans', price: 60, category: 'Clothing', rating: 4.1, inStock: true },
  { id: 8, name: 'Zapatillas', price: 100, category: 'Clothing', rating: 4.4, inStock: false },
];

export const ProductList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);

  // useMemo para filtrar y ordenar productos (cálculo costoso)
  const filteredAndSortedProducts = useMemo(() => {
    console.log('🔄 Recalculando productos filtrados...'); // Para ver cuándo se ejecuta

    let filtered = SAMPLE_PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStock = !showOnlyInStock || product.inStock;
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    // Ordenar según el criterio seleccionado
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchTerm, categoryFilter, sortBy, showOnlyInStock]); // Solo se recalcula cuando estas dependencias cambian

  // useMemo para estadísticas de productos
  const productStats = useMemo(() => {
    console.log('📊 Recalculando estadísticas...');
    
    const totalProducts = filteredAndSortedProducts.length;
    const averagePrice = totalProducts > 0 
      ? filteredAndSortedProducts.reduce((sum, product) => sum + product.price, 0) / totalProducts 
      : 0;
    const averageRating = totalProducts > 0
      ? filteredAndSortedProducts.reduce((sum, product) => sum + product.rating, 0) / totalProducts
      : 0;
    const inStockCount = filteredAndSortedProducts.filter(p => p.inStock).length;

    return {
      totalProducts,
      averagePrice: Math.round(averagePrice * 100) / 100,
      averageRating: Math.round(averageRating * 10) / 10,
      inStockCount
    };
  }, [filteredAndSortedProducts]);

  // useMemo para categorías únicas
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
    return categories;
  }, []); // Solo se calcula una vez porque SAMPLE_PRODUCTS no cambia

  return (
    <div className="product-list">
      <h2>Lista de Productos Optimizada</h2>
      
      {/* Controles de filtrado */}
      <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', minWidth: '200px' }}
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="all">Todas las categorías</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
          style={{ padding: '8px' }}
        >
          <option value="name">Ordenar por Nombre</option>
          <option value="price">Ordenar por Precio</option>
          <option value="rating">Ordenar por Rating</option>
        </select>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={showOnlyInStock}
            onChange={(e) => setShowOnlyInStock(e.target.checked)}
          />
          Solo en stock
        </label>
      </div>

      {/* Estadísticas */}
      <div className="stats" style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px'
      }}>
        <div>Total de productos: <strong>{productStats.totalProducts}</strong></div>
        <div>Precio promedio: <strong>${productStats.averagePrice}</strong></div>
        <div>Rating promedio: <strong>{productStats.averageRating}</strong></div>
        <div>En stock: <strong>{productStats.inStockCount}</strong></div>
      </div>

      {/* Lista de productos */}
      <div className="products-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '15px' 
      }}>
        {filteredAndSortedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredAndSortedProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No se encontraron productos que coincidan con los filtros
        </div>
      )}
    </div>
  );
};

// Componente memoizado para evitar re-renders innecesarios
const ProductCard = memo<{ product: Product }>(({ product }) => {
  console.log(`🎨 Renderizando ProductCard para ${product.name}`);
  
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: product.inStock ? 'white' : '#f8f8f8'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
      <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
        ${product.price}
      </p>
      <p style={{ margin: '5px 0', color: '#666' }}>
        Categoría: {product.category}
      </p>
      <p style={{ margin: '5px 0' }}>
        Rating: {'★'.repeat(Math.floor(product.rating))} ({product.rating})
      </p>
      <p style={{ 
        margin: '10px 0 0 0', 
        color: product.inStock ? '#28a745' : '#dc3545',
        fontWeight: 'bold'
      }}>
        {product.inStock ? '✓ En stock' : '✗ Agotado'}
      </p>
    </div>
  );
});

// Ejemplo 2: useCallback para optimizar funciones
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // useCallback para evitar que las funciones se recreen en cada render
  const addTodo = useCallback((text: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (text.trim()) {
      const newTodo: TodoItem = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        priority
      };
      setTodos(prev => [...prev, newTodo]);
      setNewTodoText('');
    }
  }, []); // No tiene dependencias, la función nunca cambia

  const toggleTodo = useCallback((id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []); // No tiene dependencias

  const deleteTodo = useCallback((id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []); // No tiene dependencias

  const updateTodoPriority = useCallback((id: number, priority: 'low' | 'medium' | 'high') => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, priority } : todo
    ));
  }, []); // No tiene dependencias

  // useMemo para filtrar todos
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // useMemo para estadísticas
  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const highPriority = todos.filter(t => t.priority === 'high' && !t.completed).length;
    
    return { total, completed, active, highPriority };
  }, [todos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(newTodoText);
  };

  return (
    <div className="todo-app" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Todo App Optimizada</h2>
      
      {/* Estadísticas */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div>Total: <strong>{todoStats.total}</strong></div>
        <div>Activos: <strong>{todoStats.active}</strong></div>
        <div>Completados: <strong>{todoStats.completed}</strong></div>
        <div>Alta prioridad: <strong>{todoStats.highPriority}</strong></div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Agregar nueva tarea..."
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button 
            type="submit"
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Agregar
          </button>
        </div>
      </form>

      {/* Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {(['all', 'active', 'completed'] as const).map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === filterType ? '#007bff' : '#f8f9fa',
              color: filter === filterType ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {filterType === 'all' ? 'Todas' : filterType === 'active' ? 'Activas' : 'Completadas'}
          </button>
        ))}
      </div>

      {/* Lista de todos */}
      <div className="todo-list">
        {filteredTodos.map(todo => (
          <TodoItemComponent
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdatePriority={updateTodoPriority}
          />
        ))}
      </div>
      
      {filteredTodos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {filter === 'all' ? 'No hay tareas' : `No hay tareas ${filter === 'active' ? 'activas' : 'completadas'}`}
        </div>
      )}
    </div>
  );
};

// Componente memoizado que recibe funciones estables gracias a useCallback
interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdatePriority: (id: number, priority: 'low' | 'medium' | 'high') => void;
}

const TodoItemComponent = memo<TodoItemProps>(({ todo, onToggle, onDelete, onUpdatePriority }) => {
  console.log(`🎨 Renderizando TodoItem: ${todo.text}`);

  const priorityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#dc3545'
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '8px',
      backgroundColor: todo.completed ? '#f8f9fa' : 'white',
      opacity: todo.completed ? 0.7 : 1
    }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ marginRight: '12px' }}
      />
      
      <span style={{
        flex: 1,
        textDecoration: todo.completed ? 'line-through' : 'none',
        color: todo.completed ? '#666' : '#333'
      }}>
        {todo.text}
      </span>
      
      <select
        value={todo.priority}
        onChange={(e) => onUpdatePriority(todo.id, e.target.value as 'low' | 'medium' | 'high')}
        disabled={todo.completed}
        style={{
          marginRight: '8px',
          padding: '4px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: priorityColors[todo.priority],
          color: 'white'
        }}
      >
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select>
      
      <button
        onClick={() => onDelete(todo.id)}
        style={{
          padding: '4px 8px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ✗
      </button>
    </div>
  );
});

// Ejemplo 3: Comparación de rendimiento con y sin optimizaciones
export const PerformanceComparison: React.FC = () => {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState(Array.from({ length: 1000 }, (_, i) => i));

  // Sin useMemo - se ejecuta en cada render
  const expensiveCalculationWithoutMemo = () => {
    console.log('❌ Cálculo costoso SIN useMemo ejecutándose...');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    return result;
  };

  // Con useMemo - solo se ejecuta cuando cambian las dependencias
  const expensiveCalculationWithMemo = useMemo(() => {
    console.log('✅ Cálculo costoso CON useMemo ejecutándose...');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    return result;
  }, [items]); // Solo se recalcula cuando 'items' cambia

  // Sin useCallback - función se recrea en cada render
  const handleClickWithoutCallback = () => {
    console.log('❌ Función SIN useCallback creada');
    setCount(prev => prev + 1);
  };

  // Con useCallback - función estable
  const handleClickWithCallback = useCallback(() => {
    console.log('✅ Función CON useCallback (estable)');
    setCount(prev => prev + 1);
  }, []); // Función nunca cambia

  return (
    <div style={{ padding: '20px' }}>
      <h2>Comparación de Rendimiento</h2>
      <p>Abre las DevTools para ver los logs en consola</p>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Count: {count}</p>
        <button onClick={() => setCount(c => c + 1)} style={{ marginRight: '10px' }}>
          Incrementar (causa re-render)
        </button>
        <button onClick={() => setItems(prev => [...prev, prev.length])}>
          Agregar item (recalcula useMemo)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ padding: '15px', border: '2px solid #dc3545', borderRadius: '8px' }}>
          <h3>❌ Sin Optimizaciones</h3>
          <p>Resultado cálculo costoso: {expensiveCalculationWithoutMemo().toFixed(2)}</p>
          <ExpensiveComponentWithoutMemo onClick={handleClickWithoutCallback} />
        </div>

        <div style={{ padding: '15px', border: '2px solid #28a745', borderRadius: '8px' }}>
          <h3>✅ Con Optimizaciones</h3>
          <p>Resultado cálculo costoso: {expensiveCalculationWithMemo.toFixed(2)}</p>
          <ExpensiveComponentWithMemo onClick={handleClickWithCallback} />
        </div>
      </div>
    </div>
  );
};

// Componente sin memo - se re-renderiza siempre
const ExpensiveComponentWithoutMemo: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  console.log('❌ ExpensiveComponent SIN memo renderizándose');
  return (
    <div>
      <p>Componente sin optimizar</p>
      <button onClick={onClick}>Click me</button>
    </div>
  );
};

// Componente con memo - solo se re-renderiza si las props cambian
const ExpensiveComponentWithMemo = memo<{ onClick: () => void }>(({ onClick }) => {
  console.log('✅ ExpensiveComponent CON memo renderizándose');
  return (
    <div>
      <p>Componente optimizado</p>
      <button onClick={onClick}>Click me</button>
    </div>
  );
});