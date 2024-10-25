"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ActivateAccount = () => {
  const [email, setEmail] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [message, setMessage] = useState('');
  const [isActivated, setIsActivated] = useState(false); // Nueva variable de estado
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extraer el email y el token de la URL cuando la página carga
  useEffect(() => {
    const emailFromURL = searchParams.get('email');
    const tokenFromURL = searchParams.get('token');
    if (emailFromURL) {
      setEmail(decodeURIComponent(emailFromURL));
    }
    if (tokenFromURL) {
      setActivationCode(tokenFromURL);
    }
  }, [searchParams]);

  const handleActivation = async () => {
    try {
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, activationCode }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Cuenta activada exitosamente');
        setIsActivated(true); // Cambiar el estado a "activado" si es exitoso
      } else {
        setMessage(data.message || 'Error al activar la cuenta');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al activar la cuenta');
    }
  };

  const redirectToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Activar cuenta</h1>

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        readOnly
        className="mb-4 p-2 border"
      />

      <input
        type="text"
        placeholder="Código de activación"
        value={activationCode}
        onChange={(e) => setActivationCode(e.target.value)}
        className="mb-4 p-2 border"
      />

      <button
        onClick={handleActivation}
        className="bg-green-500 text-white p-2 rounded"
      >
        Activar cuenta
      </button>

      {message && <p className="mt-4">{message}</p>}

      {isActivated && ( // Mostrar el botón solo si la cuenta fue activada
        <button
          onClick={redirectToLogin}
          className="mt-4 bg-blue-500 text-white p-2 rounded"
        >
          Iniciar Sesión
        </button>
      )}
    </div>
  );
};

export default ActivateAccount;
