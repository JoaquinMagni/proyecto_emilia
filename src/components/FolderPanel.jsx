// src/components/FolderPanel.jsx
import React, { useEffect, useState } from 'react';

const FolderPanel = ({ onClose }) => {
  const [carpetas, setCarpetas] = useState([]); // Estado para carpetas
  const [selectedCarpeta, setSelectedCarpeta] = useState(null); // Estado para la carpeta seleccionada
  const [eventos, setEventos] = useState([]); // Estado para almacenar eventos
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null; // Obtener el userId

  useEffect(() => {
    const fetchCarpetas = async () => {
      try {
        const response = await fetch('/api/carpetas'); // Ajusta la URL según tu configuración
        const data = await response.json();
        setCarpetas(data);
      } catch (error) {
        console.error('Error al obtener carpetas:', error);
      }
    };

    fetchCarpetas();
  }, []); // Solo se ejecuta una vez al montar el componente

  const handleCarpetaClick = async (carpeta) => {
    if (selectedCarpeta === carpeta) {
      setSelectedCarpeta(null); // Cerrar el subpanel si se hace clic en la misma carpeta
      setEventos([]); // Limpiar eventos al cerrar
    } else {
      setSelectedCarpeta(carpeta); // Establecer la carpeta seleccionada

      // Hacer una solicitud para obtener eventos
      try {
        if (carpeta === 'Concluidos') {
          const response = await fetch(`/api/calendar?userId=${userId}`);
          const eventosData = await response.json();
          const eventosConcluidos = eventosData.filter(evento => new Date(evento.end) < new Date()); // Filtrar eventos que ya han finalizado
          setEventos(eventosConcluidos); // Almacenar eventos en el estado
          console.log('Eventos concluidos:', eventosConcluidos); // Mostrar eventos en la consola
        } else if (carpeta === 'Próximos') {
          const response = await fetch(`/api/calendar?userId=${userId}`);
          const eventosData = await response.json();
          // Filtrar solo eventos que aún no han comenzado
          const eventosFuturos = eventosData.filter(evento => new Date(evento.start) > new Date());
          setEventos(eventosFuturos); // Almacenar eventos filtrados en el estado
          console.log('Eventos próximos:', eventosFuturos); // Mostrar eventos en la consola
        } else {
          const response = await fetch(`/api/eventosCarpetas?userId=${userId}&carpeta=${carpeta}`);
          const eventosData = await response.json();
          // Filtrar solo eventos que aún no han comenzado
          const eventosFuturos = eventosData.filter(evento => new Date(evento.start) > new Date());
          setEventos(eventosFuturos); // Almacenar eventos filtrados en el estado
          console.log('Eventos de la carpeta:', eventosFuturos); // Mostrar eventos en la consola
        }
      } catch (error) {
        console.error('Error al obtener eventos:', error);
      }
    }
  };

  return (
    <div
      className="fixed left-0 top-20 h-full w-1/6 bg-gray-800 text-white p-4 shadow-lg"
      style={{ zIndex: 1050 }} // Aumenté el z-index
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold">Carpetas</h2>
      <ul>
        {carpetas.map((carpeta) => (
          <li
            key={carpeta}
            className="mt-2 p-6 hover:bg-gray-700 cursor-pointer rounded-md border-b border-gray-600 flex justify-between items-center"
            onClick={() => handleCarpetaClick(carpeta)}
          >
          <span>{carpeta}</span>
          {carpeta === 'Microsoft' && (
            <img src="/icon-microsoft.png" alt="Microsoft" className="w-8 h-8" />
          )}
          {carpeta === 'Google' && (
            <img src="/icon-google.png" alt="Google" className="w-8 h-8" />
          )}
          {carpeta === 'Apple' && ( // Agregar condición para Apple
            <img src="/icon-apple.png" alt="Apple" className="w-8 h-8" />
          )}

          </li>
        ))}
        {/* Carpeta estática "Concluidos" */}
        <li
          key="Concluidos"
          className="mt-2 p-6 hover:bg-gray-700 cursor-pointer rounded-md border-b border-gray-600 flex justify-between items-center"
          onClick={() => handleCarpetaClick('Concluidos')}
        >
          <span>Concluidos</span>
        </li>
        {/* Carpeta estática "Próximos" */}
        <li
          key="Próximos"
          className="mt-2 p-6 hover:bg-gray-700 cursor-pointer rounded-md border-b border-gray-600 flex justify-between items-center"
          onClick={() => handleCarpetaClick('Próximos')}
        >
          <span>Próximos</span>
        </li>
      </ul>

      {/* Subpanel ajustado sin margen adicional */}
      {selectedCarpeta && (
        <div
          className="absolute left-full top-0 h-full w-full bg-gray-900 text-white p-4 shadow-xl"
          style={{ zIndex: 1051 }}
        >
          <h3 className="text-lg font-semibold">Eventos de {selectedCarpeta}</h3>
          <div className="grid grid-cols-1 gap-4 mt-4 overflow-y-auto" style={{ maxHeight: '900px' }}> {/* Ajusta la altura máxima según sea necesario */}
            {eventos.length > 0 ? (
              eventos.map((evento) => (
                <div 
                  key={evento.id} 
                  className="p-4 rounded-lg shadow-md"
                  style={{ backgroundColor: evento.color }} // Establecer color dinámico
                >
                  <h4 className="font-bold text-black">{evento.title}</h4>
                  <p className="text-sm text-black">
                    Fecha de Inicio: {new Date(evento.start).toLocaleString('es-ES', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      hour12: false 
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p>No hay eventos para esta carpeta.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderPanel;