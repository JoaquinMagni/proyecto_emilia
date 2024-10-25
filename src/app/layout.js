"use client";

import localFont from 'next/font/local';
import './globals.css';
import React from 'react';
import i18n from '../i18n'; // Importa la configuración de i18next
import { AuthProvider } from '@/context/AuthContext';


// Cargar las fuentes locales
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

function RootLayout({ children }) {
  return (
    <html> 
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
