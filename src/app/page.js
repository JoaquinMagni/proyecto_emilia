"use client";

import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import Notification from '@/components/Notification';
import FloatingButton from '@/components/calendar/FloatingButton';
import Modal from '@/components/calendar/Modal';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [eventData, setEventData] = useState({
    id: null,
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    color: '#ff9f89',
  });
  const [calendarEvents, setCalendarEvents] = useState([]);

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      router.push('/auth/login');
    } else {
      fetchEvents(); // Fetch events if user is authenticated
    }
  }, [user, router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/calendar?userId=${userId}`);
      if (!response.ok) throw new Error('Error al cargar eventos');
      const events = await response.json();
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  if (!user) return null;

  const handleFloatingButtonClick = () => {
    setEventData({
      id: null,
      title: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      color: '#ff9f89',
    });
    setModalOpen(true);
  };

  const handleSaveEvent = async () => {
    const newEvent = {
      id: eventData.id ? eventData.id : undefined,
      title: eventData.title,
      start: `${eventData.startDate}T${eventData.startTime || '00:00'}`,
      end: `${eventData.endDate}T${eventData.endTime || '23:59'}`,
      color: eventData.color,
      userId,
    };

    try {
      const method = eventData.id ? 'PUT' : 'POST';
      const response = await fetch('/api/calendar', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
      if (!response.ok) throw new Error('Error al guardar el evento');
      await response.json();

      fetchEvents(); // Refresh events after saving
      setModalOpen(false); // Close the modal
      setNotificationVisible(true); // Show notification
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };

  return (
    <div className="relative min-h-screen">
      <NavBar />
      <main className="flex flex-col justify-center items-center min-h-screen">       

        {/* Agregar calendario en la vista de lista */}
        <div className="w-full max-w-5xl p-2 mt-16">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]} // Incluye dayGridPlugin
            initialView="timeGridDay" // Cambia la vista inicial a "dayGridDay"
            events={calendarEvents}
            height="800px"
            contentHeight="700px"
            headerToolbar={{
              start: 'prev,next today', // Botones para navegar
              center: 'title', // Título del calendario
              end: 'dayGridDay,timeGridDay', // Opciones de vista
            }}
            dateClick={() => handleFloatingButtonClick()}
          />
        </div>
          <h1>Bienvenido.</h1>
          <h1 className="text-4xl font-bold mb-4">{t('home.welcomeTitle')}</h1>
          <p className="text-lg mb-4">{t('home.examplePageDescription')}</p>
          <p className="text-lg">{t('home.themeToggleInstruction')}</p>
      </main>

      <FloatingButton onClick={handleFloatingButtonClick} />

      {modalOpen && (
        <Modal
          eventData={eventData}
          setEventData={setEventData}
          handleSaveEvent={handleSaveEvent}
          handleDeleteEvent={() => {}}
          closeModal={() => setModalOpen(false)}
          selectedEvent={null}
        />
      )}

      {notificationVisible && (
        <Notification
          message="Evento añadido al calendario."
          duration={5000}
          onClose={() => setNotificationVisible(false)}
        />
      )}
    </div>
  );
}
