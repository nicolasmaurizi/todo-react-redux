import React, { useState, useEffect } from 'react';

// Ejemplo 1: Fetch de datos con cleanup
interface User {
  id: number;
  name: string;
  email: string;
}

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false; // Flag para evitar memory leaks

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular API call
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
        
        // Solo actualizar estado si el componente sigue montado
        if (!isCancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Error al cargar usuarios');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, []); // Array vacío = solo se ejecuta al montar

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-list">
      <h2>Lista de Usuarios</h2>
      {users.map(user => (
        <div key={user.id} className="user-card">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

// Ejemplo 2: Timer con cleanup
export const Timer: React.FC = () => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    // Cleanup: limpiar interval cuando el componente se desmonta o isRunning cambia
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]); // Se ejecuta cuando isRunning cambia

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  return (
    <div className="timer">
      <h2>Timer: {seconds}s</h2>
      <button onClick={toggleTimer}>
        {isRunning ? 'Pausar' : 'Iniciar'}
      </button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
};

// Ejemplo 3: Suscripción a eventos del DOM
export const WindowSize: React.FC = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Agregar event listener
    window.addEventListener('resize', handleResize);

    // Cleanup: remover event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Solo se ejecuta al montar y desmontar

  return (
    <div className="window-size">
      <h2>Tamaño de Ventana</h2>
      <p>Ancho: {windowSize.width}px</p>
      <p>Alto: {windowSize.height}px</p>
    </div>
  );
};

// Ejemplo 4: Efecto con dependencias múltiples
interface SearchProps {
  category: string;
}

export const ProductSearch: React.FC<SearchProps> = ({ category }) => {
  const [query, setQuery] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      try {
        // Simular búsqueda de productos
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockProducts = [
          { id: 1, name: `${query} en ${category}`, price: 100 },
          { id: 2, name: `${query} premium en ${category}`, price: 200 }
        ];
        setProducts(mockProducts);
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query, category]); // Se ejecuta cuando query o category cambian

  return (
    <div className="product-search">
      <input
        type="text"
        placeholder={`Buscar en ${category}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {loading && <div>Buscando...</div>}
      
      <div className="products">
        {products.map(product => (
          <div key={product.id} className="product">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};