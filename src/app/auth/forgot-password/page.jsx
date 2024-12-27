"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';  // Importamos el hook para traducción
import SubmitButton from '@/components/buttons/SubmitButton';
import LanguageSwitcher from '../../../components/buttons/LanguajeSwitcher'; // Import the LanguageSwitcher
import ThemeSwitcher from '@/components/buttons/ThemeSwitcher';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState('');

  const validateForm = () => {
    let newError = '';

    if (!username.trim()) {
      newError = t('forgotPassword.username') + ' ' + t('forgotPassword.isRequired');
    } else if (!email.trim()) {
      newError = t('forgotPassword.email') + ' ' + t('forgotPassword.isRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newError = t('forgotPassword.invalidEmail');
    }

    setErrors(newError);

    return !newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch('/api/send-reset-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, username }),
        });
  
        if (response.ok) {
          alert('Password reset email sent to: ' + email);
        } else {
          const errorData = await response.json(); // Obtener el mensaje de error del servidor
          alert('User not found: ' + errorData.message); // Mostrar el mensaje de error aunque el email no sea correcto.
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again later.'); // Mensaje de error general
      }
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="relative flex flex-col sm:flex-row h-screen">
      {/* Logo en la esquina superior izquierda */}
      <div className="absolute top-0 left-0 p-4 flex items-center space-x-2">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="w-24 sm:w-32 md:w-36 lg:w-48 h-auto"
        />
      </div>

      {/* Cambiador de idioma */}
      <div className="absolute top-0 right-0 p-4 items-center flex space-x-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      {/* Lado izquierdo: Imagen o ilustración */}
      <div className="hidden sm:flex w-full md:w-1/2 lg:w-2/3 items-center justify-center bg-gray-100">
        <img 
          src="/login/login-bg.svg" 
          alt={t('forgotPassword.altIllustration')}  // Traducción
          className="w-full h-auto max-w-lg"
        />
      </div>

      {/* Lado derecho: Formulario */}
      <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col items-center justify-center p-8 sm:mt-0 mt-32">
        <h1 className="text-3xl font-bold mb-4">{t('forgotPassword.title')}</h1>
        <p className="text-gray-500 mb-8">
          {t('forgotPassword.description')}
        </p>

        <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('forgotPassword.usernamePlaceholder')}
            className="border border-gray-300 rounded w-full p-2 mb-4"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('forgotPassword.emailPlaceholder')}
            className="border border-gray-300 rounded w-full p-2 mb-4"
          />
          <SubmitButton 
            text={t('forgotPassword.submit')} 
            variant="primary"
            className="w-full mb-4"
            onClick={handleSubmit}
          />
        </form>

          {/* Botón para regresar al login */}
          <SubmitButton 
            text={t('forgotPassword.backToLogin')} 
            variant="secondary" 
            type="button" 
            onClick={handleBackToLogin} 
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
