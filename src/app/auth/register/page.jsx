"use client";

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import SubmitButton from '@/components/buttons/SubmitButton';
import LanguageSwitcher from '@/components/buttons/LanguajeSwitcher';
import ThemeSwitcher from '@/components/buttons/ThemeSwitcher';

const CreateAccount = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    timezone: '',
    nationality: '',
    language: ''
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    timezone: '',
    nationality: '',
    language: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = t('register.usernameRequired');
    
    if (!formData.password.trim()) newErrors.password = t('register.passwordRequired');
    else if (formData.password.length < 8) newErrors.password = t('register.passwordTooShort');
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('register.passwordsMismatch');
    
    if (!formData.email.trim()) newErrors.email = t('register.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('register.invalidEmail');
    
    if (!formData.firstName.trim()) newErrors.firstName = t('register.firstNameRequired');
    
    if (!formData.lastName.trim()) newErrors.lastName = t('register.lastNameRequired');
    
    if (!formData.birthDate) newErrors.birthDate = t('register.birthDateRequired');
    
    if (!formData.timezone) newErrors.timezone = t('register.timezoneRequired');
    
    if (!formData.nationality) newErrors.nationality = t('register.nationalityRequired');
    
    if (!formData.language) newErrors.language = t('register.languageRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    if (validateForm()) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData), // Enviando formData completo
        });
  
        const data = await response.json();
        if (response.ok) {
          console.log('Usuario registrado con éxito');
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error al enviar el formulario:', error);
      }
    }
    setIsSubmitting(false);
  }, [formData, validateForm]);
  

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Opciones para los campos de selección
  const timezoneOptions = [
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'CET', label: 'CET (Central European Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' },
    { value: 'AEST', label: 'AEST (Australian Eastern Standard Time)' },
    { value: 'IST', label: 'IST (India Standard Time)' },
    { value: 'BRT', label: 'BRT (Brasilia Time)' },
    { value: 'MSK', label: 'MSK (Moscow Standard Time)' },
    { value: 'CST', label: 'CST (China Standard Time)' }
  ];

  const nationalityOptions = [
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'JP', label: 'Japan' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'BR', label: 'Brazil' },
    { value: 'IN', label: 'India' },
    { value: 'ES', label: 'Spain' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español (Spanish)' },
    { value: 'fr', label: 'Français (French)' },
    { value: 'de', label: 'Deutsch (German)' },
    { value: 'it', label: 'Italiano (Italian)' },
    { value: 'pt', label: 'Português (Portuguese)' },
    { value: 'ru', label: 'Русский (Russian)' },
    { value: 'zh', label: '中文 (Chinese)' },
    { value: 'ja', label: '日本語 (Japanese)' },
    { value: 'ar', label: 'العربية (Arabic)' }
  ];

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
          alt="Register Illustration" 
          className="w-full h-auto max-w-lg"
        />
      </div>

      {/* Formulario con scroll */}
      <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col items-center justify-center p-8 sm:mt-0 mt-32 max-h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 mt-20">{t('register.createAccount')}</h1>
        <p className="text-gray-500 mb-8">{t('register.joinModernize')}</p>      

        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <InputField
            label={t('register.username')}
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            error={errors.username}
          />
          <InputField
            label={t('register.password')}
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
          />
          <InputField
            label={t('register.confirmPassword')}
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
          />
          <InputField
            label={t('register.email')}
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
          />
          <InputField
            label={t('register.firstName')}
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
          />
          <InputField
            label={t('register.lastName')}
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
          />
          <InputField
            label={t('register.birthDate')}
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            error={errors.birthDate}
          />
          <SelectField
            label={t('register.timezone')}
            id="timezone"
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            error={errors.timezone}
            options={timezoneOptions}
          />
          <SelectField
            label={t('register.nationality')}
            id="nationality"
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            error={errors.nationality}
            options={nationalityOptions}
          />
          <SelectField
            label={t('register.language')}
            id="language"
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            error={errors.language}
            options={languageOptions}
          />
          <SubmitButton 
            text={t('register.signUp')} 
            isSubmitting={isSubmitting} 
            onClick={handleSubmit}
          />
        </form>

        <div className="mt-4">
          <span>{t('register.alreadyHaveAccount')}</span>
          <Link href="/auth/login" className="text-blue-500 ml-2">{t('register.signIn')}</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
