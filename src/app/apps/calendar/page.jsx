"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/calendar/Calendar';

function CalendarPage() {
    const router = useRouter();

    useEffect(() => {
        // Verifica si el token existe en localStorage
        const token = localStorage.getItem('token');

        // Si no existe, redirigir al usuario a la página de inicio de sesión
        if (!token) {
            router.push('/auth/login');
        }
    }, [router]);

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            <Calendar />
        </div>
    );
}

export default CalendarPage;

