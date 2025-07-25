import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';

// Ejemplo 1: useRef para referencias DOM
export const FocusableInput: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const selectAllText = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      setInputValue('');
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Control de Input con useRef</h3>
      <div style={{ marginBottom: '10px' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe algo aquí..."
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
      </div>
      <div>
        <button onClick={focusInput} style={{ marginRight: '10px' }}>
          Enfocar Input
        </button>
        <button onClick={selectAllText} style={{ marginRight: '10px' }}>
          Seleccionar Todo
        </button>
        <button onClick={clearInput}>
          Limpiar
        </button>
      </div>
      <p>Valor actual: {inputValue}</p>
    </div>
  );
};

// Ejemplo 2: useRef para valores mutables que no causan re-render
export const TimerWithRef: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTimeRef.current;
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        elapsedTimeRef.current = elapsed;
        setTime(elapsed);
      }, 10);
    }
  };

  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setTime(0);
    elapsedTimeRef.current = 0;
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Cronómetro con useRef</h3>
      <div style={{ fontSize: '48px', fontFamily: 'monospace', margin: '20px 0' }}>
        {formatTime(time)}
      </div>
      <div>
        <button 
          onClick={startTimer} 
          disabled={isRunning}
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px',
            backgroundColor: isRunning ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Iniciar
        </button>
        <button 
          onClick={pauseTimer} 
          disabled={!isRunning}
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px',
            backgroundColor: !isRunning ? '#6c757d' : '#ffc107',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Pausar
        </button>
        <button 
          onClick={resetTimer}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Ejemplo 3: useRef para scroll y mediciones
export const ScrollController: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollInfo, setScrollInfo] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    isAtTop: true,
    isAtBottom: false
  });

  const updateScrollInfo = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setScrollInfo({
        scrollTop,
        scrollHeight,
        clientHeight,
        isAtTop: scrollTop === 0,
        isAtBottom: scrollTop + clientHeight >= scrollHeight - 1
      });
    }
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ 
        top: containerRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  };

  const scrollToMiddle = () => {
    if (containerRef.current) {
      const middle = (containerRef.current.scrollHeight - containerRef.current.clientHeight) / 2;
      containerRef.current.scrollTo({ top: middle, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Control de Scroll con useRef</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={scrollToTop} style={{ marginRight: '10px' }}>
          Ir al Inicio
        </button>
        <button onClick={scrollToMiddle} style={{ marginRight: '10px' }}>
          Ir al Medio
        </button>
        <button onClick={scrollToBottom}>
          Ir al Final
        </button>
      </div>

      <div
        ref={containerRef}
        onScroll={updateScrollInfo}
        style={{
          height: '300px',
          overflowY: 'auto',
          border: '2px solid #ddd',
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: '#f8f9fa'
        }}
      >
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <h4>Elemento {i + 1}</h4>
            <p>Este es el contenido del elemento número {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        <p>Scroll Top: {scrollInfo.scrollTop}px</p>
        <p>Altura Total: {scrollInfo.scrollHeight}px</p>
        <p>Altura Visible: {scrollInfo.clientHeight}px</p>
        <p>Estado: {scrollInfo.isAtTop ? '🔝 Arriba' : scrollInfo.isAtBottom ? '🔽 Abajo' : '📍 Medio'}</p>
      </div>
    </div>
  );
};

// Ejemplo 4: useImperativeHandle - Componente Modal avanzado
interface ModalHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const Modal = forwardRef<ModalHandle, ModalProps>(({ title, children, onClose }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      onClose?.();
      // Restaurar foco al elemento anterior
      setTimeout(() => {
        previousFocusRef.current?.focus();
      }, 100);
    },
    toggle: () => {
      setIsOpen(prev => !prev);
    },
    isOpen
  }), [isOpen, onClose]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Enfocar el modal cuando se abre
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Trap focus dentro del modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
          onClose?.();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '0',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
});

// Ejemplo 5: useImperativeHandle - Input con validación avanzada
interface ValidatedInputHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  validate: () => boolean;
  getValue: () => string;
  setValue: (value: string) => void;
  getErrors: () => string[];
}

interface ValidatedInputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => string | null;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

const ValidatedInput = forwardRef<ValidatedInputHandle, ValidatedInputProps>(({
  label,
  type = 'text',
  required = false,
  minLength,
  maxLength,
  pattern,
  customValidator,
  onValidationChange
}, ref) => {
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (inputValue: string): string[] => {
    const validationErrors: string[] = [];

    if (required && !inputValue.trim()) {
      validationErrors.push(`${label} es requerido`);
    }

    if (inputValue && minLength && inputValue.length < minLength) {
      validationErrors.push(`${label} debe tener al menos ${minLength} caracteres`);
    }

    if (inputValue && maxLength && inputValue.length > maxLength) {
      validationErrors.push(`${label} no puede tener más de ${maxLength} caracteres`);
    }

    if (inputValue && pattern && !pattern.test(inputValue)) {
      validationErrors.push(`${label} tiene un formato inválido`);
    }

    if (inputValue && type === 'email' && !/\S+@\S+\.\S+/.test(inputValue)) {
      validationErrors.push(`${label} debe ser un email válido`);
    }

    if (inputValue && customValidator) {
      const customError = customValidator(inputValue);
      if (customError) {
        validationErrors.push(customError);
      }
    }

    return validationErrors;
  };

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      setValue('');
      setErrors([]);
      setTouched(false);
    },
    validate: () => {
      const validationErrors = validate(value);
      setErrors(validationErrors);
      setTouched(true);
      const isValid = validationErrors.length === 0;
      onValidationChange?.(isValid, validationErrors);
      return isValid;
    },
    getValue: () => value,
    setValue: (newValue: string) => {
      setValue(newValue);
      if (touched) {
        const validationErrors = validate(newValue);
        setErrors(validationErrors);
        onValidationChange?.(validationErrors.length === 0, validationErrors);
      }
    },
    getErrors: () => errors
  }), [value, errors, touched, label, required, minLength, maxLength, pattern, customValidator, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (touched) {
      const validationErrors = validate(newValue);
      setErrors(validationErrors);
      onValidationChange?.(validationErrors.length === 0, validationErrors);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validationErrors = validate(value);
    setErrors(validationErrors);
    onValidationChange?.(validationErrors.length === 0, validationErrors);
  };

  const hasErrors = touched && errors.length > 0;

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{
          width: '100%',
          padding: '8px',
          border: hasErrors ? '2px solid #dc3545' : '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      />
      {hasErrors && (
        <div style={{ marginTop: '4px' }}>
          {errors.map((error, index) => (
            <div key={index} style={{ color: '#dc3545', fontSize: '12px' }}>
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Componente de demostración que usa los componentes con useImperativeHandle
export const ImperativeHandleDemo: React.FC = () => {
  const modalRef = useRef<ModalHandle>(null);
  const nameInputRef = useRef<ValidatedInputHandle>(null);
  const emailInputRef = useRef<ValidatedInputHandle>(null);
  const passwordInputRef = useRef<ValidatedInputHandle>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleOpenModal = () => {
    modalRef.current?.open();
  };

  const handleValidateForm = () => {
    const nameValid = nameInputRef.current?.validate() ?? false;
    const emailValid = emailInputRef.current?.validate() ?? false;
    const passwordValid = passwordInputRef.current?.validate() ?? false;

    if (nameValid && emailValid && passwordValid) {
      setFormData({
        name: nameInputRef.current?.getValue() ?? '',
        email: emailInputRef.current?.getValue() ?? '',
        password: passwordInputRef.current?.getValue() ?? ''
      });
      alert('¡Formulario válido! Datos guardados.');
    } else {
      alert('Por favor corrige los errores en el formulario.');
    }
  };

  const handleClearForm = () => {
    nameInputRef.current?.clear();
    emailInputRef.current?.clear();
    passwordInputRef.current?.clear();
    setFormData({ name: '', email: '', password: '' });
  };

  const customPasswordValidator = (password: string): string | null => {
    if (password.length > 0 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    return null;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Demostración de useImperativeHandle</h3>
      
      <button 
        onClick={handleOpenModal}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginBottom: '20px'
        }}
      >
        Abrir Modal
      </button>

      <Modal
        ref={modalRef}
        title="Formulario de Registro"
        onClose={() => console.log('Modal cerrado')}
      >
        <ValidatedInput
          ref={nameInputRef}
          label="Nombre"
          required
          minLength={2}
          maxLength={50}
        />
        
        <ValidatedInput
          ref={emailInputRef}
          label="Email"
          type="email"
          required
        />
        
        <ValidatedInput
          ref={passwordInputRef}
          label="Contraseña"
          type="password"
          required
          minLength={8}
          customValidator={customPasswordValidator}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={handleValidateForm}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Validar y Guardar
          </button>
          
          <button
            onClick={handleClearForm}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Limpiar Formulario
          </button>
        </div>

        {formData.name && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
            <h4>Datos Guardados:</h4>
            <p>Nombre: {formData.name}</p>
            <p>Email: {formData.email}</p>
            <p>Contraseña: {'*'.repeat(formData.password.length)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};