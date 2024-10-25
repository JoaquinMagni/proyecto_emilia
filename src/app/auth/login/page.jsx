"use client";

import { useState, useContext } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import SocialLoginButton from '@/components/buttons/SocialLoginButton';
import SubmitButton from '@/components/buttons/SubmitButton';
import LanguageSwitcher from '@/components/buttons/LanguajeSwitcher';
import ThemeSwitcher from '@/components/buttons/ThemeSwitcher';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Cambiado a next/navigation

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const router = useRouter(); // Usar el hook correctamente

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = t('login.usernameRequired');
    }

    if (!password.trim()) {
      newErrors.password = t('login.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Verifica si se está ejecutando el submit
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Añadir log para verificar que se realiza la solicitud correctamente
        console.log('Enviando datos al servidor:', { username, password });
        
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        console.log('Respuesta del servidor:', data); // Verifica la respuesta del servidor

        if (response.ok) {
          // Almacenar el token en localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.user.id);

          // Llamar al login desde el AuthContext para actualizar el estado global
          login(data.user, data.token);

          // Redirigir a la página principal
          router.push('/');
        } else {
          setErrors({ username: '', password: data.message });
        }
      } catch (error) {
        console.error('Error en la solicitud de login:', error); // Añadimos más logs
        setErrors({ username: '', password: 'Error al iniciar sesión' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative flex flex-col sm:flex-row h-screen">
      {/* Logo */}
      <div className="absolute top-0 left-0 p-4 flex items-center space-x-2">
        <img src="/logo.svg" alt="Logo" className="w-24 sm:w-32 md:w-36 lg:w-48 h-auto" />
      </div>

      {/* Language Switcher */}
      <div className="absolute top-0 right-0 p-4 items-center flex space-x-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      {/* Imagen lateral */}
      <div className="hidden sm:flex w-full md:w-1/2 lg:w-2/3 items-center justify-center bg-gray-100">
        <img src="/login/login-bg.svg" alt="Login Background" className="w-full h-auto max-w-lg" />
      </div>

      {/* Formulario */}
      <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col items-center justify-center p-8 sm:mt-0 mt-32">
        <h1 className="text-3xl font-bold mb-4">{t('login.welcome')}</h1>
        <p className="text-gray-500 mb-8">{t('login.adminDashboard')}</p>

        <div className="flex space-x-4 mb-6">
          <SocialLoginButton iconSrc="/login/google-icon.svg" text={t('login.signInGoogle')} altText="Google" />
          <SocialLoginButton iconSrc="/login/facebook-icon.svg" text={t('login.signInFB')} altText="Facebook" />
        </div>

        <div className="text-gray-400 mb-6">{t('login.orSignInWith')}</div>

        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">{t('login.username')}</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className={`border border-gray-300 rounded w-full p-2 ${errors.username ? 'border-red-500' : ''}`}
              placeholder={t('login.usernamePlaceholder')}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">{t('login.password')}</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className={`border border-gray-300 rounded w-full p-2 ${errors.password ? 'border-red-500' : ''}`}
              placeholder={t('login.passwordPlaceholder')}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>{t('login.rememberDevice')}</span>
            </label>
            <Link href="/auth/forgot-password" className="text-blue-500">{t('login.forgotPassword')}</Link>
          </div>

          <SubmitButton type="submit" text={isSubmitting ? 'Enviando...' : t('login.signIn')} disabled={isSubmitting} />
        </form>

        <div className="mt-4">
          <span>{t('login.newToModernize')}</span>
          <Link href="/auth/register" className="text-blue-500 ml-2">{t('login.createAccount')}</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
