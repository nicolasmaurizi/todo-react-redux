import React, { useState, useEffect, useRef, useCallback } from 'react';

// Hook personalizado 1: useLocalStorage
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // Función para obtener el valor inicial del localStorage
  const getStoredValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Función para actualizar el valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Función para remover el valor
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
};

// Hook personalizado 2: useFetch
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { ...state, refetch };
};

// Hook personalizado 3: useDebounce
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook personalizado 4: useOnClickOutside
export const useOnClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// Hook personalizado 5: useIntersectionObserver
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return { isIntersecting, entry };
};

// Hook personalizado 6: useAsync
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      }));
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, execute };
};

// Hook personalizado 7: useToggle
export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }] as const;
};

// Hook personalizado 8: useWindowSize
export const useWindowSize = () => {
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

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Hook personalizado 9: useCountdown
export const useCountdown = (initialTime: number) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  return {
    timeLeft,
    isActive,
    start,
    pause,
    reset,
    isFinished: timeLeft === 0
  };
};

// Hook personalizado 10: useForm
interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

type FormState<T> = {
  [K in keyof T]: FormField;
};

type ValidationRules<T> = {
  [K in keyof T]?: (value: string) => string | null;
};

export const useForm = <T extends Record<string, string>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {}
) => {
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const initialState = {} as FormState<T>;
    Object.keys(initialValues).forEach(key => {
      const fieldKey = key as keyof T;
      initialState[fieldKey] = {
        value: initialValues[fieldKey],
        error: null,
        touched: false
      };
    });
    return initialState;
  });

  const setValue = (field: keyof T, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: null
      }
    }));
  };

  const setTouched = (field: keyof T) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true
      }
    }));
  };

  const validateField = (field: keyof T) => {
    const validator = validationRules[field];
    if (validator) {
      const error = validator(formState[field].value);
      setFormState(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          error
        }
      }));
      return error === null;
    }
    return true;
  };

  const validateForm = () => {
    let isValid = true;
    const newState = { ...formState };

    Object.keys(formState).forEach(key => {
      const fieldKey = key as keyof T;
      const validator = validationRules[fieldKey];
      if (validator) {
        const error = validator(formState[fieldKey].value);
        newState[fieldKey] = {
          ...newState[fieldKey],
          error,
          touched: true
        };
        if (error) isValid = false;
      }
    });

    setFormState(newState);
    return isValid;
  };

  const resetForm = () => {
    const resetState = {} as FormState<T>;
    Object.keys(initialValues).forEach(key => {
      const fieldKey = key as keyof T;
      resetState[fieldKey] = {
        value: initialValues[fieldKey],
        error: null,
        touched: false
      };
    });
    setFormState(resetState);
  };

  const getValues = () => {
    const values = {} as T;
    Object.keys(formState).forEach(key => {
      const fieldKey = key as keyof T;
      values[fieldKey] = formState[fieldKey].value as T[keyof T];
    });
    return values;
  };

  const hasErrors = Object.values(formState).some(field => field.error !== null);
  const isFormTouched = Object.values(formState).some(field => field.touched);

  return {
    formState,
    setValue,
    setTouched,
    validateField,
    validateForm,
    resetForm,
    getValues,
    hasErrors,
    isFormTouched
  };
};

// Componentes de demostración usando los hooks personalizados

// Demo 1: useLocalStorage
export const LocalStorageDemo: React.FC = () => {
  const [name, setName, removeName] = useLocalStorage('user-name', '');
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    theme: 'light',
    language: 'es',
    notifications: true
  });

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>useLocalStorage Demo</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Nombre: </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingresa tu nombre"
          style={{ marginLeft: '10px', padding: '5px' }}
        />
        <button onClick={removeName} style={{ marginLeft: '10px' }}>
          Limpiar
        </button>
      </div>

      <div>
        <h4>Preferencias:</h4>
        <div>
          <label>
            Tema: 
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
              style={{ marginLeft: '10px' }}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
            />
            Notificaciones
          </label>
        </div>
      </div>

      <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        Los datos se guardan automáticamente en localStorage
      </p>
    </div>
  );
};

// Demo 2: useFetch
export const FetchDemo: React.FC = () => {
  const { data, loading, error, refetch } = useFetch<any[]>('https://jsonplaceholder.typicode.com/posts?_limit=5');

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>useFetch Demo</h3>
      
      <button onClick={refetch} style={{ marginBottom: '15px' }}>
        Recargar Datos
      </button>

      {loading && <div>Cargando...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {data && (
        <div>
          <h4>Posts:</h4>
          {data.map((post: any) => (
            <div key={post.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h5>{post.title}</h5>
              <p>{post.body.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Demo 3: useDebounce
export const DebounceDemo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // Simular búsqueda cuando cambia el término debounced
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Simular API call
      const mockResults = [
        `Resultado 1 para "${debouncedSearchTerm}"`,
        `Resultado 2 para "${debouncedSearchTerm}"`,
        `Resultado 3 para "${debouncedSearchTerm}"`
      ];
      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>useDebounce Demo</h3>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar... (debounce 500ms)"
        style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
      />

      <p>Término actual: {searchTerm}</p>
      <p>Término debounced: {debouncedSearchTerm}</p>

      {searchResults.length > 0 && (
        <div>
          <h4>Resultados de búsqueda:</h4>
          {searchResults.map((result, index) => (
            <div key={index} style={{ padding: '5px', backgroundColor: '#e9ecef', margin: '5px 0', borderRadius: '4px' }}>
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Demo 4: useToggle y useWindowSize
export const ToggleAndWindowDemo: React.FC = () => {
  const [isVisible, { toggle, setTrue, setFalse }] = useToggle(false);
  const { width, height } = useWindowSize();

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>useToggle & useWindowSize Demo</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button onClick={toggle} style={{ marginRight: '10px' }}>
          Toggle
        </button>
        <button onClick={setTrue} style={{ marginRight: '10px' }}>
          Mostrar
        </button>
        <button onClick={setFalse}>
          Ocultar
        </button>
      </div>

      {isVisible && (
        <div style={{ padding: '15px', backgroundColor: '#d4ffd4', borderRadius: '4px', marginBottom: '15px' }}>
          ¡Contenido visible!
        </div>
      )}

      <div>
        <h4>Tamaño de ventana:</h4>
        <p>Ancho: {width}px</p>
        <p>Alto: {height}px</p>
        <p>Redimensiona la ventana para ver los cambios en tiempo real</p>
      </div>
    </div>
  );
};

// Demo 5: useCountdown
export const CountdownDemo: React.FC = () => {
  const { timeLeft, isActive, start, pause, reset, isFinished } = useCountdown(60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>useCountdown Demo</h3>
      
      <div style={{ 
        fontSize: '48px', 
        fontFamily: 'monospace', 
        textAlign: 'center', 
        margin: '20px 0',
        color: isFinished ? 'red' : timeLeft <= 10 ? 'orange' : 'black'
      }}>
        {formatTime(timeLeft)}
      </div>

      {isFinished && (
        <div style={{ 
          textAlign: 'center', 
          color: 'red', 
          fontSize: '24px', 
          fontWeight: 'bold',
          marginBottom: '15px'
        }}>
          ¡Tiempo terminado!
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={start} 
          disabled={isActive || isFinished}
          style={{ marginRight: '10px' }}
        >
          Iniciar
        </button>
        <button 
          onClick={pause} 
          disabled={!isActive}
          style={{ marginRight: '10px' }}
        >
          Pausar
        </button>
        <button onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
};

// Demo 6: useForm
export const FormDemo: React.FC = () => {
  const { formState, setValue, setTouched, validateForm, resetForm, getValues, hasErrors } = useForm(
    {
      email: '',
      password: '',
      confirmPassword: ''
    },
    {
      email: (value) => {
        if (!value) return 'Email es requerido';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email inválido';
        return null;
      },
      password: (value) => {
        if (!value) return 'Contraseña es requerida';
        if (value.length < 8) return 'Contraseña debe tener al menos 8 caracteres';
        return null;
      },
      confirmPassword: (value) => {
        const password = formState.password?.value || '';
        if (!value) return 'Confirmar contraseña es requerido';
        if (value !== password) return 'Las contraseñas no coinciden';
        return null;
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Formulario válido: ' + JSON.stringify(getValues(), null, 2));
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>useForm Demo</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={formState.email.value}
            onChange={(e) => setValue('email', e.target.value)}
            onBlur={() => setTouched('email')}
            style={{
              width: '100%',
              padding: '8px',
              border: formState.email.error ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {formState.email.touched && formState.email.error && (
            <div style={{ color: 'red', fontSize: '14px' }}>{formState.email.error}</div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={formState.password.value}
            onChange={(e) => setValue('password', e.target.value)}
            onBlur={() => setTouched('password')}
            style={{
              width: '100%',
              padding: '8px',
              border: formState.password.error ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {formState.password.touched && formState.password.error && (
            <div style={{ color: 'red', fontSize: '14px' }}>{formState.password.error}</div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            value={formState.confirmPassword.value}
            onChange={(e) => setValue('confirmPassword', e.target.value)}
            onBlur={() => setTouched('confirmPassword')}
            style={{
              width: '100%',
              padding: '8px',
              border: formState.confirmPassword.error ? '2px solid red' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {formState.confirmPassword.touched && formState.confirmPassword.error && (
            <div style={{ color: 'red', fontSize: '14px' }}>{formState.confirmPassword.error}</div>
          )}
        </div>

        <div>
          <button type="submit" style={{ marginRight: '10px' }}>
            Enviar
          </button>
          <button type="button" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      {hasErrors && (
        <div style={{ marginTop: '15px', color: 'red' }}>
          El formulario tiene errores
        </div>
      )}
    </div>
  );
};