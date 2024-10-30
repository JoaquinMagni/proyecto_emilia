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
  const [iCalEvents, setICalEvents] = useState([]); // Track iCal events separately
  const [modalOpen, setModalOpen] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [googleEvents, setGoogleEvents] = useState([]); // Google events
  const [showICalModal, setShowICalModal] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState('');
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
      start: `${eventData.startDate}T${eventData.startTime || '00:00'}:00`,
      end: `${eventData.endDate}T${eventData.endTime || '23:59'}:00`,
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
      startDate: new Date().toISOString().split('T')[0], // Fecha actual
      endDate: new Date().toISOString().split('T')[0],   // Mismo día de inicio
      startTime: '00:00',
      endTime: '23:59',
      color: '#ff9f89',
    });
    setSelectedEvent(null);
    setModalOpen(true);
  };
  

// Función para obtener y mostrar eventos de iCal
const fetchICalEvents = async () => {
  try {
    const response = await fetch(`/api/icalEvents?url=${encodeURIComponent(calendarUrl)}`);
    const data = await response.json();

    console.log("Eventos iCal recibidos:", data);

    if (Array.isArray(data)) {
      const fetchedICalEvents = data.map(event => ({
        ...event,
        color: '#4285F4',
        isICalEvent: true,
      }));
      setICalEvents(fetchedICalEvents); // Almacena los eventos de iCal en `iCalEvents` directamente
    } else {
      console.error("Expected an array but received:", data);
    }
  } catch (error) {
    console.error('Error al obtener eventos iCal:', error);
  }
};

const saveICalEventsToDatabase = async () => {
  try {
    // Fetch iCal data from the URL
    const response = await fetch(`/api/icalEvents?url=${encodeURIComponent(calendarUrl)}`);
    const iCalData = await response.json();

    console.log("Eventos iCal recibidos:", iCalData);

    if (!Array.isArray(iCalData) || iCalData.length === 0) {
      console.error("No iCal events to save.");
      return;
    }

    // Format events for database
    const formattedEvents = iCalData.map(event => ({
      userId,
      title: event.title || "Sin título",
      start: convertDateToMySQLFormat(event.start),
      end: convertDateToMySQLFormat(event.end),
      color: event.color || "#4285F4",
    }));

    // Save events to the database
    const saveResponse = await fetch('/api/saveICalEvents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, url: calendarUrl, events: formattedEvents }),
    });

    const result = await saveResponse.json();
    console.log("Respuesta del servidor:", result);

    if (!saveResponse.ok) throw new Error('Error al guardar eventos en la base de datos');
    console.log("Eventos y URL guardados en la base de datos.");

    // Refresh the page after saving events
    window.location.reload();

  } catch (error) {
    console.error('Error:', error);
  }
};

// Helper function to format dates to MySQL
const convertDateToMySQLFormat = (dateString) => {
  return dateString.replace("T", " ").replace(".000Z", ""); 
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
              className="rounded p-1 text-white w-full h-full flex items-center"
            >
              <b>{eventInfo.event.title}</b>
              {eventInfo.event.backgroundColor === "#4285F4" && (
                <img src="/icon-google.png" alt="Google" className="w-4 h-4 ml-2" />
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

      <button
        onClick={() => setShowICalModal(true)}
        className="bg-blue-600 text-white mb-2 px-4 py-2 rounded-full flex items-center justify-center space-x-2 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 ease-in-out mx-auto w-1/3"
      >
        Añadir iCal URL
      </button>

      {/* Modal para ingresar la URL de iCal */}
      {showICalModal && (
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setShowICalModal(false)} // Close on outside click
      >
        <div
          className="bg-white p-6 rounded-md w-full max-w-md relative" 
          onClick={(e) => e.stopPropagation()} // Prevent click from closing modal if inside
        >
          <button 
            onClick={() => setShowICalModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <h2 className="text-lg font-semibold mb-4">Ingresar URL de iCal</h2>
          <input
            type="text"
            value={calendarUrl}
            onChange={(e) => setCalendarUrl(e.target.value)}
            placeholder="Ingrese su URL de iCal"
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={async () => {
              await fetchICalEvents();
              await saveICalEventsToDatabase();
              setShowICalModal(false);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Cargar Eventos
          </button>
        </div>
      </div>
    )}


      
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
