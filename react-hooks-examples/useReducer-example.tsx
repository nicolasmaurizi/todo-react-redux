import React, { useReducer, useContext, createContext, ReactNode } from 'react';

// Ejemplo 1: Carrito de Compras con useReducer
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'APPLY_DISCOUNT'; payload: number };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        error: null
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.id });
      }

      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'APPLY_DISCOUNT': {
      const discountAmount = state.total * (action.payload / 100);
      return {
        ...state,
        total: state.total - discountAmount
      };
    }

    default:
      return state;
  }
};

const initialCartState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null
};

// Context para el carrito
interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (percentage: number) => void;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyDiscount = (percentage: number) => {
    dispatch({ type: 'APPLY_DISCOUNT', payload: percentage });
  };

  const checkout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simular proceso de checkout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular posible error
      if (Math.random() < 0.1) {
        throw new Error('Error en el procesamiento del pago');
      }
      
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      });
    }
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount,
    checkout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Componentes que usan el carrito
export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useCart();

  return (
    <div className="product-card" style={{ border: '1px solid #ccc', padding: '16px', margin: '8px' }}>
      <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addItem(product)}>
        Agregar al Carrito
      </button>
    </div>
  );
};

export const CartSummary: React.FC = () => {
  const { state, updateQuantity, removeItem, clearCart, applyDiscount, checkout } = useCart();

  if (state.items.length === 0) {
    return <div>El carrito está vacío</div>;
  }

  return (
    <div className="cart-summary">
      <h2>Carrito de Compras ({state.itemCount} items)</h2>
      
      {state.error && (
        <div style={{ color: 'red', padding: '8px', backgroundColor: '#ffe6e6' }}>
          {state.error}
        </div>
      )}

      {state.items.map(item => (
        <div key={item.id} className="cart-item" style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #eee' }}>
          <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', marginRight: '12px' }} />
          <div style={{ flex: 1 }}>
            <h4>{item.name}</h4>
            <p>${item.price} x {item.quantity} = ${item.price * item.quantity}</p>
          </div>
          <div>
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
            <span style={{ margin: '0 8px' }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            <button onClick={() => removeItem(item.id)} style={{ marginLeft: '8px', color: 'red' }}>
              Eliminar
            </button>
          </div>
        </div>
      ))}

      <div className="cart-actions" style={{ marginTop: '16px' }}>
        <h3>Total: ${state.total.toFixed(2)}</h3>
        
        <button onClick={() => applyDiscount(10)} style={{ marginRight: '8px' }}>
          Aplicar 10% Descuento
        </button>
        
        <button onClick={clearCart} style={{ marginRight: '8px' }}>
          Vaciar Carrito
        </button>
        
        <button 
          onClick={checkout} 
          disabled={state.isLoading}
          style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px' }}
        >
          {state.isLoading ? 'Procesando...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

// Ejemplo 2: Formulario complejo con useReducer
interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

interface ComplexFormState {
  fields: {
    firstName: FormField;
    lastName: FormField;
    email: FormField;
    phone: FormField;
    address: FormField;
    city: FormField;
    zipCode: FormField;
  };
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
}

type FormAction =
  | { type: 'SET_FIELD'; payload: { field: keyof ComplexFormState['fields']; value: string } }
  | { type: 'SET_FIELD_ERROR'; payload: { field: keyof ComplexFormState['fields']; error: string | null } }
  | { type: 'SET_FIELD_TOUCHED'; payload: { field: keyof ComplexFormState['fields'] } }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_SUBMIT_ERROR'; payload: string | null }
  | { type: 'SET_SUBMIT_SUCCESS'; payload: boolean }
  | { type: 'RESET_FORM' };

const createInitialField = (): FormField => ({
  value: '',
  error: null,
  touched: false
});

const initialFormState: ComplexFormState = {
  fields: {
    firstName: createInitialField(),
    lastName: createInitialField(),
    email: createInitialField(),
    phone: createInitialField(),
    address: createInitialField(),
    city: createInitialField(),
    zipCode: createInitialField()
  },
  isSubmitting: false,
  submitError: null,
  submitSuccess: false
};

const formReducer = (state: ComplexFormState, action: FormAction): ComplexFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.field]: {
            ...state.fields[action.payload.field],
            value: action.payload.value,
            error: null // Limpiar error cuando el usuario escribe
          }
        }
      };

    case 'SET_FIELD_ERROR':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.field]: {
            ...state.fields[action.payload.field],
            error: action.payload.error
          }
        }
      };

    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.field]: {
            ...state.fields[action.payload.field],
            touched: true
          }
        }
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload
      };

    case 'SET_SUBMIT_ERROR':
      return {
        ...state,
        submitError: action.payload,
        isSubmitting: false
      };

    case 'SET_SUBMIT_SUCCESS':
      return {
        ...state,
        submitSuccess: action.payload,
        isSubmitting: false
      };

    case 'RESET_FORM':
      return initialFormState;

    default:
      return state;
  }
};

export const ComplexForm: React.FC = () => {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const validateField = (field: keyof ComplexFormState['fields'], value: string): string | null => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return value.trim().length < 2 ? 'Debe tener al menos 2 caracteres' : null;
      case 'email':
        return !/\S+@\S+\.\S+/.test(value) ? 'Email inválido' : null;
      case 'phone':
        return !/^\d{10}$/.test(value.replace(/\D/g, '')) ? 'Teléfono debe tener 10 dígitos' : null;
      case 'address':
        return value.trim().length < 5 ? 'Dirección muy corta' : null;
      case 'city':
        return value.trim().length < 2 ? 'Ciudad requerida' : null;
      case 'zipCode':
        return !/^\d{5}$/.test(value) ? 'Código postal debe tener 5 dígitos' : null;
      default:
        return null;
    }
  };

  const handleFieldChange = (field: keyof ComplexFormState['fields'], value: string) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  };

  const handleFieldBlur = (field: keyof ComplexFormState['fields']) => {
    dispatch({ type: 'SET_FIELD_TOUCHED', payload: { field } });
    const error = validateField(field, state.fields[field].value);
    dispatch({ type: 'SET_FIELD_ERROR', payload: { field, error } });
  };

  const validateForm = (): boolean => {
    let isValid = true;

    Object.keys(state.fields).forEach(fieldName => {
      const field = fieldName as keyof ComplexFormState['fields'];
      const error = validateField(field, state.fields[field].value);
      if (error) {
        dispatch({ type: 'SET_FIELD_ERROR', payload: { field, error } });
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });
    dispatch({ type: 'SET_SUBMIT_ERROR', payload: null });

    try {
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular posible error del servidor
      if (Math.random() < 0.2) {
        throw new Error('Error del servidor. Intente nuevamente.');
      }

      dispatch({ type: 'SET_SUBMIT_SUCCESS', payload: true });
      setTimeout(() => {
        dispatch({ type: 'RESET_FORM' });
      }, 3000);

    } catch (error) {
      dispatch({ 
        type: 'SET_SUBMIT_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      });
    }
  };

  if (state.submitSuccess) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
        ¡Formulario enviado exitosamente! Se reiniciará en unos segundos...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Formulario de Registro</h2>

      {state.submitError && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '16px' }}>
          {state.submitError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {Object.entries(state.fields).map(([fieldName, field]) => {
          const name = fieldName as keyof ComplexFormState['fields'];
          const labels = {
            firstName: 'Nombre',
            lastName: 'Apellido',
            email: 'Email',
            phone: 'Teléfono',
            address: 'Dirección',
            city: 'Ciudad',
            zipCode: 'Código Postal'
          };

          return (
            <div key={fieldName}>
              <label>{labels[name]}:</label>
              <input
                type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'}
                value={field.value}
                onChange={(e) => handleFieldChange(name, e.target.value)}
                onBlur={() => handleFieldBlur(name)}
                disabled={state.isSubmitting}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: field.error ? '2px solid #dc3545' : '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              {field.touched && field.error && (
                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                  {field.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={state.isSubmitting}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: state.isSubmitting ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: state.isSubmitting ? 'not-allowed' : 'pointer'
        }}
      >
        {state.isSubmitting ? 'Enviando...' : 'Enviar Formulario'}
      </button>
    </form>
  );
};