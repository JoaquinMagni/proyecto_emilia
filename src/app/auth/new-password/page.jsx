"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Usa useSearchParams
import { useTranslation } from 'react-i18next';
import SubmitButton from '@/components/buttons/SubmitButton';
import LanguageSwitcher from '../../../components/buttons/LanguajeSwitcher';
import ThemeSwitcher from '@/components/buttons/ThemeSwitcher';

const NewPassword = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams(); // Obtén los parámetros de consulta
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token'); // Obtén el token
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    } else {
      console.error('Token is missing from the URL');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!token) {
      console.error('Token is not set');
      return;
    }

    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, token }),
      });

      if (response.ok) {
        console.log('Password updated successfully');
        router.push('/auth/login');
      } else {
        console.error('Failed to update password');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="relative flex flex-col sm:flex-row h-screen">
      <div className="absolute top-0 left-0 p-4 flex items-center space-x-2">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="w-24 sm:w-32 md:w-36 lg:w-48 h-auto"
        />
      </div>

      <div className="absolute top-0 right-0 p-4 items-center flex space-x-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <div className="hidden sm:flex w-full md:w-1/2 lg:w-2/3 items-center justify-center bg-gray-100">
        <img 
          src="/login/login-bg.svg" 
          alt={t('newPassword.altIllustration')}
          className="w-full h-auto max-w-lg"
        />
      </div>

      <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col items-center justify-center p-8 sm:mt-0 mt-32">
        <h1 className="text-3xl font-bold mb-4">{t('newPassword.title')}</h1>
        <p className="text-gray-500 mb-8">
          {t('newPassword.description')}
        </p>

        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">{t('newPassword.password')}</label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded w-full p-2"
                placeholder={t('newPassword.passwordPlaceholder')}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">{t('newPassword.confirmPassword')}</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded w-full p-2"
                placeholder={t('newPassword.confirmPasswordPlaceholder')}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <SubmitButton 
              text={t('newPassword.submit')} 
              variant="primary" 
              className="mb-4" 
              onClick={handleSubmit}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;