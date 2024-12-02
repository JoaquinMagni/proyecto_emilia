import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from './Modal';
import NavBar from '../NavBar';
import FloatingButton from './FloatingButton';
import Notification from '../Notification';
import '../../app/globals.css';

function CalendarComponent() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [iCalEvents, setICalEvents] = useState([]); // Track iCal events separately
  const [modalOpen, setModalOpen] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showICalModal, setShowICalModal] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState('');  
  const [zoomedImage, setZoomedImage] = useState(null);
  const [eventData, setEventData] = useState({
    id: null,
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    color: '#ff9f89',
  });

  const images = [
    "/integrateIcal1.png",
    "/integrateIcal2.png",
    "/integrateIcal3.png",
    "/integrateIcal4.jpg",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Empieza con la primera imagen.  

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + images.length) % images.length
    );
  };

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const GOOGLE_COLOR = '#4285F4';
  const MICROSOFT_COLOR = '#F25022';

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/calendar?userId=${userId}`);
      if (!response.ok) throw new Error('Error al cargar eventos');
      const events = await response.json();
      if (Array.isArray(events)) {
        const enhancedEvents = events.map(event => ({
          ...event,
          googleEvent: event.color === GOOGLE_COLOR, // Marca como evento de Google
          microsoftEvent: event.color === MICROSOFT_COLOR, // Marca como evento de Microsoft
        }));
        setCalendarEvents(enhancedEvents);
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
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    color: '#4285F4', // Color predeterminado para Google
    googleEvent: true, // Identificador de Google
  });
  
  const transformMicrosoftEvent = (event) => ({
    id: event.id,
    title: event.subject || 'Sin título',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    color: '#F25022', // Color predeterminado para Microsoft
    microsoftEvent: true, // Identificador de Microsoft
  });

  useEffect(() => {
    if (!userId) {
      console.error('UserId not found in localStorage');
      return;
    }
    fetchEvents();
  }, [userId]);

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


  // Function to fetch the iCal URL from the database
  const fetchICalUrl = async () => {
    try {
      const response = await fetch(`/api/saveICalEvents?userId=${userId}`);
      if (!response.ok) throw new Error('Error al obtener la URL de iCal');
      const data = await response.json();
      if (data.url) {
        setCalendarUrl(data.url);
      } else {
        setCalendarUrl(''); // Clear the URL if none is found
      }
    } catch (error) {
      console.error('Error al obtener la URL de iCal:', error);
    }
  };

  // Function to handle opening the iCal modal
  const handleOpenICalModal = async () => {
    await fetchICalUrl(); // Fetch the URL before opening the modal
    setShowICalModal(true);
  };

const verifyAndAddICalEvents = async () => {
  if (!calendarUrl) {
    console.log('No iCal URL found.');
    return;
  }

  try {
    const response = await fetch(`/api/icalEvents?url=${encodeURIComponent(calendarUrl)}`);
    const iCalData = await response.json();

    if (!Array.isArray(iCalData) || iCalData.length === 0) {
      console.log('No new iCal events to add.');
      return;
    }

    const formattedEvents = iCalData.map(event => ({
      userId,
      title: event.title || "Sin título",
      start: convertDateToMySQLFormat(event.start),
      end: convertDateToMySQLFormat(event.end),
      color: event.color || "#4285F4",
    }));

    // Limpia los eventos de iCal antes de agregar nuevos
    setICalEvents([]);

    const saveResponse = await fetch('/api/saveICalEvents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, url: calendarUrl, events: formattedEvents }),
    });

    const result = await saveResponse.json();
    console.log("Respuesta del servidor:", result);

    if (!saveResponse.ok) throw new Error('Error al guardar eventos en la base de datos');
    console.log("Eventos y URL guardados en la base de datos.");

    // Añade los eventos al estado después de limpiar
    setICalEvents(prevICalEvents => [...prevICalEvents, ...uniqueEvents(prevICalEvents, formattedEvents)]);
    setCalendarEvents(prevEvents => [...prevEvents, ...uniqueEvents(prevEvents, formattedEvents)]);

  } catch (error) {
    console.error('Error:', error);
  }
};


const uniqueEvents = (existingEvents, newEvents) => {
  const existingIds = new Set(existingEvents.map(event => event.id));
  return newEvents.filter(event => !existingIds.has(event.id));
};

const steps = [
  "1) Inicia sesión en tu Calendario de Google. 2) En Mis calendarios, en el menú de la izquierda, busque su cuenta de calendario y haga clic en los puntos suspensivos verticales (⋮).",
  "3) Seleccione Configuración y compartir.",
  "4) En 'Configuración del calendario', en el lado izquierdo de la pantalla, haga clic en Permisos de acceso y confirme que el calendario sea público.",
  "5) En 'Configuración del calendario', haz clic en Integrar calendario y copia la URL en Dirección pública en formato iCal. Esta dirección es la que debemos pegar en el campo de abajo.",
];


  
  
useEffect(() => {
  const initialize = async () => {
    await fetchICalUrl();
    // Solo carga y verifica eventos si `calendarUrl` está disponible y no hay eventos ya cargados
    if (calendarUrl && iCalEvents.length === 0) {
      await verifyAndAddICalEvents();
    }
  };

  initialize();
}, []); // Quita `calendarUrl` de las dependencias para evitar recargar múltiples veces

  


  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex justify-center w-full flex-grow p-4 mt-32">

        <div className="w-[70%] h-[60vh] overflow-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth" // Cambia a dayGridMonth para la vista de calendario mensual
          headerToolbar={{
            start: 'prev,next today',
            center: 'title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
          }}
          events={[...calendarEvents, ...iCalEvents]}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={(eventInfo) => {
            const isGoogle = eventInfo.event.extendedProps.googleEvent;
            const isMicrosoft = eventInfo.event.extendedProps.microsoftEvent;
          
            return (
              <div
                className="event-box"
                style={{
                  backgroundColor: eventInfo.event.backgroundColor,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  textAlign: 'center',
                  display: 'flex', // Alineación de ícono y texto
                  alignItems: 'center',
                  gap: '4px',
                  width: '100%',
                }}
              >
                {isGoogle && (
                  <img
                    src="/icon-google.png"
                    alt="Google"
                    style={{ width: '16px', height: '16px' }}
                  />
                )}
                {isMicrosoft && (
                  <img
                    src="/icon-microsoft.png"
                    alt="Microsoft"
                    style={{ width: '16px', height: '16px' }}
                  />
                )}
                <span>{eventInfo.event.title}</span>
              </div>
            );
          }}
          
          height="auto"
          contentHeight="auto"
        />

        </div>
      </div>
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
        onClick={handleOpenICalModal}
        className="bg-blue-600 text-white mb-2 px-4 py-2 rounded-full flex items-center justify-center space-x-2 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 ease-in-out mx-auto w-1/3"
      >
        Añadir iCal URL
      </button>

{/* Modal para ingresar la URL de iCal */}
{showICalModal && (
  <div 
    className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => setShowICalModal(false)} // Cierra al hacer clic afuera
  >
    <div
      className="bg-white p-6 rounded-md w-full max-w-2xl h-[85vh] overflow-y-auto relative"
      onClick={(e) => e.stopPropagation()} // Previene cierre al hacer clic dentro
    >
      <button 
        onClick={() => setShowICalModal(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      {/* Carrusel manual */}
      <div className="mt-2">
        <h2 className="text-lg font-semibold text-gray-800">Guía de integración:</h2>
        {/* Paso correspondiente */}
        <p className="text-lg font-semibold text-gray-600 text-center mt-4">{steps[currentImageIndex]}</p>
        <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
          {/* Flecha izquierda */}
          {currentImageIndex > 0 && (
            <button
              onClick={handlePreviousImage}
              className="absolute left-0 bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 focus:outline-none"
            >
              ←
            </button>
          )}

          {/* Imagen actual */}
          <img
            src={images[currentImageIndex]}
            alt={`Guía paso ${currentImageIndex + 1}`}
            className="w-auto h-auto max-w-full max-h-[80%] mx-auto rounded-md shadow-md object-contain cursor-zoom-in"
            onClick={() => setZoomedImage(images[currentImageIndex])} // Hacer zoom al hacer clic
          />

          {/* Flecha derecha */}
          {currentImageIndex < images.length - 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-0 bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 focus:outline-none"
            >
              →
            </button>
          )}
        </div>

      </div>

      <h2 className="text-lg font-semibold">Ingresa la URL de iCal:</h2>
      {/* Input para ingresar la URL */}
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

{/* Modal de zoom de imagen */}
{zoomedImage && (
  <div
    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    onClick={() => setZoomedImage(null)} // Cierra el zoom al hacer clic afuera
  >
    <img
      src={zoomedImage}
      alt="Imagen ampliada"
      className="max-w-[90%] max-h-[90%] rounded-md shadow-lg object-contain cursor-zoom-out"
      onClick={(e) => e.stopPropagation()} // Previene cierre al hacer clic en la imagen
    />
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
      <CalendarComponent />
  );
}

export default Calendar;
