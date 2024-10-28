import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import Modal from './Modal';
import NavBar from '../NavBar';
import FloatingButton from './FloatingButton';
import Notification from '../Notification';

function CalendarComponent() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [googleEvents, setGoogleEvents] = useState([]); // Google events
  const [eventData, setEventData] = useState({
    id: null,
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    color: '#ff9f89',
  });

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/calendar?userId=${userId}`);
      if (!response.ok) throw new Error('Error al cargar eventos');
      const events = await response.json();
      if (Array.isArray(events)) {
        setCalendarEvents(events);
      } else {
        throw new Error('La respuesta de la API no es un array');
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  const transformGoogleEvent = (event) => ({
    id: event.id,
    title: event.summary || 'Sin título',
    start: event.start?.dateTime || event.start?.date || '',  // Added null checks
    end: event.end?.dateTime || event.end?.date || '',
    color: '#4285F4',
    googleEvent: true,
  });

  const fetchGoogleEvents = async (accessToken) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.items) {
        const googleEvents = data.items.map(transformGoogleEvent);
        setGoogleEvents(googleEvents);
      }
    } catch (error) {
      console.error('Error fetching Google events:', error);
    }
  };

  useEffect(() => {
    if (!userId) {
      console.error('UserId not found in localStorage');
      return;
    }
    fetchEvents();
  }, [userId]);

  // Merge Google and Local Events
  const mergedEvents = [...calendarEvents, ...googleEvents];

  // Google Login Handler
  const handleGoogleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
    onSuccess: async (tokenResponse) => {
      console.log("Logged in with Google:", tokenResponse);
      await fetchGoogleEvents(tokenResponse.access_token); // Asegúrate de enviar el token correcto
    },
    onError: () => {
      console.log('Error al iniciar sesión con Google');
    },
  });

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

      await fetchEvents();
      setModalOpen(false);

      setNotificationMessage(eventData.id ? 'Evento modificado correctamente.' : 'Evento añadido al calendario.');
      setNotificationVisible(true);
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await fetch(`/api/calendar?id=${eventData.id}`, {
        method: 'DELETE',
      });
      setCalendarEvents((prevEvents) => prevEvents.filter((evt) => evt.id !== eventData.id));
      await fetchEvents();
      setModalOpen(false);
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    }
  };

  const handleDateClick = (info) => {
    setEventData({
      id: null,
      title: '',
      startDate: info.dateStr,
      endDate: info.dateStr,
      startTime: '',
      endTime: '',
      color: '#ff9f89',
    });
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (info) => {
    const event = info.event;
    setSelectedEvent(event);
    setEventData({
      id: event.id,
      title: event.title || '',
      startDate: event.start ? event.start.toISOString().split('T')[0] : '',
      endDate: event.end ? event.end.toISOString().split('T')[0] : '',
      startTime: event.start ? event.start.toTimeString().slice(0, 5) : '',
      endTime: event.end ? event.end.toTimeString().slice(0, 5) : '',
      color: event.backgroundColor || '#ff9f89',
    });
    setModalOpen(true);
  };

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
    setSelectedEvent(null);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex justify-center w-full flex-grow p-4 mt-32">

        <div className="w-[70%] h-[60vh] overflow-auto">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              start: 'prev,next today',
              center: 'title',
              end: 'dayGridMonth,timeGridWeek,timeGridDay, listMonth',
            }}
            events={mergedEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventContent={(eventInfo) => (
              <div
                style={{ backgroundColor: eventInfo.event.backgroundColor }}
                className="rounded p-1 text-white w-full h-full"
              >
                <b>{eventInfo.event.title}</b>
                {eventInfo.event.extendedProps.googleEvent && (
                  <img src="/icon-google.png" alt="Google" className="w-4 h-4 ml-2 inline-block" />
                )}
              </div>
            )}
            height="auto"
            contentHeight="auto"
          />
        </div>
      </div>
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white mb-32 px-4 py-2 rounded-full flex items-center justify-center space-x-2 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 ease-in-out mt-8 mx-auto w-1/3"
      >
        <img src="/icon-google.png" alt="Google icon" className="w-6 h-6" />
        <span>Sincronizar con Google Calendar</span>
      </button>
      {modalOpen && (
        <Modal
          eventData={eventData}
          setEventData={setEventData}
          handleSaveEvent={handleSaveEvent}
          handleDeleteEvent={handleDeleteEvent}
          closeModal={() => setModalOpen(false)}
          selectedEvent={selectedEvent}
        />
      )}
      <FloatingButton onClick={handleFloatingButtonClick} />
      
      {notificationVisible && (
        <Notification
          message={notificationMessage}
          duration={5000}
          onClose={() => setNotificationVisible(false)}
        />
      )}
    </div>
  );
}

// Wrapping the CalendarComponent within the GoogleOAuthProvider
function Calendar() {
  return (
    <GoogleOAuthProvider clientId="583483058528-f3nard0eo1n1c7a0359075i9r19o954i.apps.googleusercontent.com">
      <CalendarComponent />
    </GoogleOAuthProvider>
  );
}

export default Calendar;
