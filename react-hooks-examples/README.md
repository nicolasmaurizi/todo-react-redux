# Guía Completa de React Hooks con Ejemplos Profesionales

Esta guía contiene ejemplos profesionales de todos los hooks principales de React, incluyendo hooks personalizados avanzados.

## 📚 Tabla de Contenidos

1. [Hooks Básicos](#hooks-básicos)
   - [useState](#usestate)
   - [useEffect](#useeffect)
   - [useContext](#usecontext)

2. [Hooks Adicionales](#hooks-adicionales)
   - [useReducer](#usereducer)
   - [useMemo](#usememo)
   - [useCallback](#usecallback)
   - [useRef](#useref)
   - [useImperativeHandle](#useimperativehandle)

3. [Hooks Personalizados](#hooks-personalizados)
   - [useLocalStorage](#uselocalstorage)
   - [useFetch](#usefetch)
   - [useDebounce](#usedebounce)
   - [useToggle](#usetoggle)
   - [useForm](#useform)
   - [Y muchos más...](#otros-hooks-personalizados)

---

## Hooks Básicos

### useState

**¿Qué es?** Hook que permite agregar estado local a componentes funcionales.

**¿Cuándo usarlo?**
- Cuando necesitas manejar datos que cambian en el tiempo
- Para controlar el estado de formularios
- Para toggles, contadores, y cualquier valor mutable

**Ejemplo básico:**
```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', email: '' });
```

**Casos de uso profesionales:**
- ✅ Formularios con validación
- ✅ Contadores y toggles
- ✅ Estados de carga (loading, error, success)
- ✅ Datos temporales del componente

**Ver ejemplos completos en:** `useState-example.tsx`

---

### useEffect

**¿Qué es?** Hook para manejar efectos secundarios en componentes funcionales.

**¿Cuándo usarlo?**
- Llamadas a APIs
- Suscripciones a eventos
- Limpieza de recursos
- Actualizaciones del DOM

**Sintaxis:**
```tsx
useEffect(() => {
  // Efecto
  return () => {
    // Cleanup (opcional)
  };
}, [dependencies]); // Array de dependencias
```

**Patrones importantes:**
- `[]` - Se ejecuta solo al montar
- `[dep1, dep2]` - Se ejecuta cuando cambian las dependencias
- Sin array - Se ejecuta en cada render
- Función de cleanup - Para limpiar recursos

**Casos de uso profesionales:**
- ✅ Fetch de datos con cleanup
- ✅ Timers e intervalos
- ✅ Event listeners
- ✅ WebSocket connections
- ✅ Intersection observers

**Ver ejemplos completos en:** `useEffect-example.tsx`

---

### useContext

**¿Qué es?** Hook para consumir valores de un Context sin usar Consumer.

**¿Cuándo usarlo?**
- Estado global de la aplicación
- Temas (theme)
- Autenticación
- Configuraciones compartidas

**Patrón recomendado:**
```tsx
// 1. Crear el contexto
const ThemeContext = createContext();

// 2. Hook personalizado
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

// 3. Provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**Casos de uso profesionales:**
- ✅ Sistema de autenticación
- ✅ Manejo de temas
- ✅ Configuración de idioma
- ✅ Estado global de la app

**Ver ejemplos completos en:** `useContext-example.tsx`

---

## Hooks Adicionales

### useReducer

**¿Qué es?** Hook para manejar estado complejo con un patrón similar a Redux.

**¿Cuándo usarlo?**
- Estado complejo con múltiples sub-valores
- Lógica de estado compleja
- Cuando el próximo estado depende del anterior
- Optimización de rendimiento

**Patrón:**
```tsx
const [state, dispatch] = useReducer(reducer, initialState);

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}
```

**Ventajas sobre useState:**
- ✅ Lógica de estado centralizada
- ✅ Más predecible para estados complejos
- ✅ Mejor para testing
- ✅ Optimizaciones de rendimiento

**Casos de uso profesionales:**
- ✅ Carrito de compras
- ✅ Formularios complejos
- ✅ Estados de aplicación con múltiples acciones
- ✅ Máquinas de estado

**Ver ejemplos completos en:** `useReducer-example.tsx`

---

### useMemo

**¿Qué es?** Hook para memoizar valores calculados costosos.

**¿Cuándo usarlo?**
- Cálculos costosos que no deben ejecutarse en cada render
- Crear objetos/arrays que se pasan como props
- Optimización de rendimiento

**Sintaxis:**
```tsx
const expensiveValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);
```

**⚠️ No abusar de useMemo:**
- Solo para cálculos realmente costosos
- No para valores primitivos simples
- Medir el rendimiento antes y después

**Casos de uso profesionales:**
- ✅ Filtrado y ordenamiento de listas grandes
- ✅ Cálculos matemáticos complejos
- ✅ Transformación de datos
- ✅ Objetos de configuración

**Ver ejemplos completos en:** `useMemo-useCallback-example.tsx`

---

### useCallback

**¿Qué es?** Hook para memoizar funciones y evitar re-creaciones innecesarias.

**¿Cuándo usarlo?**
- Funciones que se pasan como props a componentes hijos
- Dependencias de otros hooks
- Optimización de rendimiento

**Sintaxis:**
```tsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

**Combinación poderosa:**
```tsx
const MemoizedChild = memo(ChildComponent);

const Parent = () => {
  const stableFunction = useCallback(() => {
    // función estable
  }, []);
  
  return <MemoizedChild onClick={stableFunction} />;
};
```

**Casos de uso profesionales:**
- ✅ Event handlers en componentes optimizados
- ✅ Funciones que se pasan a múltiples hijos
- ✅ Dependencias de useEffect
- ✅ Callbacks de formularios

**Ver ejemplos completos en:** `useMemo-useCallback-example.tsx`

---

### useRef

**¿Qué es?** Hook para crear referencias mutables que persisten durante toda la vida del componente.

**¿Cuándo usarlo?**
- Acceder a elementos DOM
- Almacenar valores mutables que no causan re-render
- Timers, intervalos
- Valores anteriores

**Casos de uso:**

1. **Referencias DOM:**
```tsx
const inputRef = useRef(null);
const focusInput = () => inputRef.current.focus();
```

2. **Valores mutables:**
```tsx
const countRef = useRef(0);
countRef.current += 1; // No causa re-render
```

**Casos de uso profesionales:**
- ✅ Focus management
- ✅ Scroll control
- ✅ Timers e intervalos
- ✅ Valores anteriores
- ✅ Instancias de clases

**Ver ejemplos completos en:** `useRef-useImperativeHandle-example.tsx`

---

### useImperativeHandle

**¿Qué es?** Hook para personalizar el valor de instancia que se expone a componentes padre cuando usan ref.

**¿Cuándo usarlo?**
- Componentes de librería que necesitan exponer métodos
- Modales, formularios complejos
- Componentes con APIs imperativas

**Patrón:**
```tsx
const MyComponent = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => setInputValue(''),
    validate: () => validateInput()
  }));
  
  return <input ref={inputRef} />;
});
```

**Casos de uso profesionales:**
- ✅ Componentes de formulario avanzados
- ✅ Modales con control externo
- ✅ Componentes de librería
- ✅ Integración con librerías de terceros

**Ver ejemplos completos en:** `useRef-useImperativeHandle-example.tsx`

---

## Hooks Personalizados

### useLocalStorage

**¿Qué hace?** Sincroniza estado con localStorage automáticamente.

```tsx
const [name, setName, removeName] = useLocalStorage('user-name', '');
```

**Características:**
- ✅ Sincronización automática
- ✅ Manejo de errores
- ✅ TypeScript support
- ✅ SSR safe

---

### useFetch

**¿Qué hace?** Maneja llamadas HTTP con estado de loading, error y data.

```tsx
const { data, loading, error, refetch } = useFetch('/api/users');
```

**Características:**
- ✅ Cancelación automática de requests
- ✅ Estados de loading y error
- ✅ Función de refetch
- ✅ TypeScript generics

---

### useDebounce

**¿Qué hace?** Retrasa la actualización de un valor hasta que se detenga el cambio.

```tsx
const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

**Casos de uso:**
- ✅ Búsquedas en tiempo real
- ✅ Validación de formularios
- ✅ Resize handlers
- ✅ API calls optimizadas

---

### useToggle

**¿Qué hace?** Simplifica el manejo de valores booleanos.

```tsx
const [isOpen, { toggle, setTrue, setFalse }] = useToggle(false);
```

---

### useForm

**¿Qué hace?** Maneja formularios complejos con validación.

```tsx
const { formState, setValue, validateForm, resetForm } = useForm(
  { email: '', password: '' },
  { email: (value) => !value ? 'Required' : null }
);
```

**Características:**
- ✅ Validación automática
- ✅ Estados touched/error
- ✅ TypeScript support
- ✅ Reset functionality

---

## Otros Hooks Personalizados

### useWindowSize
Detecta cambios en el tamaño de la ventana.

### useCountdown
Maneja temporizadores de cuenta regresiva.

### useAsync
Maneja operaciones asíncronas con estados.

### useOnClickOutside
Detecta clicks fuera de un elemento.

### useIntersectionObserver
Detecta cuando un elemento entra en viewport.

**Ver todos los ejemplos en:** `custom-hooks-example.tsx`

---

## 🚀 Mejores Prácticas

### 1. **Naming Conventions**
```tsx
// ✅ Bueno
const [isLoading, setIsLoading] = useState(false);
const [users, setUsers] = useState([]);

// ❌ Malo
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);
```

### 2. **Dependencias de useEffect**
```tsx
// ✅ Bueno - todas las dependencias incluidas
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ❌ Malo - dependencia faltante
useEffect(() => {
  fetchUser(userId);
}, []); // ESLint warning
```

### 3. **Cleanup en useEffect**
```tsx
// ✅ Bueno - siempre limpiar recursos
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

### 4. **Optimización con useMemo/useCallback**
```tsx
// ✅ Bueno - solo cuando es necesario
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ❌ Malo - uso innecesario
const simpleValue = useMemo(() => {
  return a + b;
}, [a, b]);
```

### 5. **Hooks Personalizados**
```tsx
// ✅ Bueno - lógica reutilizable
const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
};
```

---

## 🔧 Herramientas Recomendadas

1. **ESLint Plugin**: `eslint-plugin-react-hooks`
2. **DevTools**: React Developer Tools
3. **Testing**: React Testing Library
4. **TypeScript**: Para mejor type safety

---

## 📖 Recursos Adicionales

- [Documentación oficial de React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Reglas de los Hooks](https://reactjs.org/docs/hooks-rules.html)
- [FAQ de Hooks](https://reactjs.org/docs/hooks-faq.html)

---

## 🎯 Conclusión

Los hooks han revolucionado la forma de escribir componentes en React, permitiendo:

- ✅ **Reutilización de lógica** entre componentes
- ✅ **Componentes más simples** y fáciles de entender
- ✅ **Mejor separación de responsabilidades**
- ✅ **Optimizaciones de rendimiento** más granulares
- ✅ **Testing más sencillo**

Recuerda: **Los hooks son solo funciones**, pero con reglas específicas que debes seguir para aprovechar todo su potencial.

---

*Esta guía contiene ejemplos profesionales listos para usar en proyectos reales. Cada archivo de ejemplo incluye casos de uso avanzados con TypeScript, manejo de errores, y mejores prácticas.*