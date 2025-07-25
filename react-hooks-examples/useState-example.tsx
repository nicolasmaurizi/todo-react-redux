import React, { useState } from 'react';

// Ejemplo 1: Contador simple
export const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  return (
    <div className="counter">
      <h2>Contador: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

// Ejemplo 2: Formulario con múltiples estados
interface UserForm {
  name: string;
  email: string;
  age: number;
}

export const UserFormComponent: React.FC = () => {
  const [formData, setFormData] = useState<UserForm>({
    name: '',
    email: '',
    age: 0
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<UserForm>>({});

  const handleInputChange = (field: keyof UserForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserForm> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.email.includes('@')) newErrors.email = 'Email inválido';
    if (formData.age < 18) newErrors.age = 'Debe ser mayor de 18 años';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Usuario creado:', formData);
      
      // Reset form
      setFormData({ name: '', email: '', age: 0 });
    } catch (error) {
      console.error('Error al crear usuario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={isSubmitting}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={isSubmitting}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label>Edad:</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
          disabled={isSubmitting}
        />
        {errors.age && <span className="error">{errors.age}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
};