"use client";

import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar"; // Importar NavBar

const EventsPage = () => {
  const [carpetas, setCarpetas] = useState([]); // Estado para carpetas
  const [selectedCarpeta, setSelectedCarpeta] = useState("Próximos"); // Inicializar con "Próximos"
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

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        let response;
        if (selectedCarpeta === "Concluidos" || selectedCarpeta === "Próximos") {
          response = await fetch(`/api/calendar?userId=${userId}`);
        } else {
          response = await fetch(`/api/eventosCarpetas?userId=${userId}&carpeta=${selectedCarpeta}`);
        }

        const eventosData = await response.json();

        let eventosFiltrados;
        if (selectedCarpeta === "Concluidos") {
          eventosFiltrados = eventosData.filter(evento => new Date(evento.end) < new Date());
        } else if (selectedCarpeta === "Próximos") {
          eventosFiltrados = eventosData.filter(evento => new Date(evento.start) > new Date());
        } else {
          // Filtrar eventos para carpetas personalizadas
          eventosFiltrados = eventosData.filter(evento => new Date(evento.start) > new Date());
        }

        setEventos(eventosFiltrados); // Almacenar eventos filtrados en el estado
      } catch (error) {
        console.error('Error al obtener eventos:', error);
      }
    };

    fetchEventos();
  }, [userId, selectedCarpeta]); // Dependiendo de userId y selectedCarpeta

  const handleCarpetaClick = (carpeta) => {
    setSelectedCarpeta(carpeta); // Establecer la carpeta seleccionada
  };

  return (
    <>
      <NavBar showFolderPanel={false} /> {/* Mostrar el NavBar sin el FolderPanel */}
      <div className="flex mt-20">
        <div className="w-1/6 bg-gray-800 text-white p-4 shadow-lg">
            <h2 className="text-xl font-semibold">Carpetas</h2>
            <ul>
            {carpetas.map((carpeta) => (
                <li
                key={carpeta}
                className={`mt-2 p-6 hover:bg-gray-700 cursor-pointer rounded-md border-b border-gray-600 ${selectedCarpeta === carpeta ? 'bg-gray-600' : ''}`}
                onClick={() => handleCarpetaClick(carpeta)}
                >
                <span className="flex items-center justify-between">
                    <span>{carpeta}</span>
                    {carpeta === 'Microsoft' && <img src="/icon-microsoft.png" alt="Microsoft" className="w-8 h-8 ml-2" />}
                    {carpeta === 'Google' && <img src="/icon-google.png" alt="Google" className="w-8 h-8 ml-2" />}
                    {carpeta === 'Apple' && <img src="/icon-apple.png" alt="Apple" className="w-8 h-8 ml-2" />}
                </span>
                </li>
            ))}
            {/* Carpeta estática "Concluidos" */}
            <li
                key="Concluidos"
                className={`mt-2 p-6 hover:bg-gray-700 cursor-pointer rounded-md border-b border-gray-600 ${selectedCarpeta === 'Concluidos' ? 'bg-gray-600' : ''}`}
                onClick={() => handleCarpetaClick('Concluidos')}
            >
                <span className="flex items-center justify-between">
                <span>Concluidos</span>
                <img src="/check.png" alt="Concluidos" className="w-8 h-8 ml-2" />
                </span>
            </li>
            {/* Carpeta estática "Próximos" */}
            <li
                key="Próximos"
                className={`mt-2 p-6 hover:bg-gray-700 cursor-pointer rounded-md border-b border-gray-600 ${selectedCarpeta === 'Próximos' ? 'bg-gray-600' : ''}`}
                onClick={() => handleCarpetaClick('Próximos')}
            >
                <span className="flex items-center justify-between">
                <span>Próximos</span>
                <img src="/clock.png" alt="Próximos" className="w-8 h-8 ml-2" />
                </span>
            </li>
            </ul>
        </div>
        <div className="w-1/6 p-4 bg-gray-900 shadow-xl"> {/* Ajusta el ancho aquí */}
            <h2 className="text-xl text-white font-semibold">Eventos de {selectedCarpeta}</h2>
            <div className="p-4 mt-4 overflow-y-auto" style={{ maxHeight: '900px' }}>
            {eventos.length > 0 ? (
                eventos.map((evento) => (
                <div key={evento.id} className="p-4 rounded-lg shadow-md mt-2" style={{ backgroundColor: evento.color }}>
                    <h4 className="font-bold text-black">{evento.title}</h4>
                    <p className="text-sm text-black">
                    Fecha de Inicio: {new Date(evento.start).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                </div>
                ))
            ) : (
                <p className="text-white">No hay eventos para esta carpeta.</p>
            )}
            </div>
        </div>
        </div>
    </>
  );
};

export default EventsPage;