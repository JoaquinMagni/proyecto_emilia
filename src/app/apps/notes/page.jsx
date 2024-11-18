"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 6;

  useEffect(() => {
    const fetchNotes = async () => {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/notes?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        const data = await response.json();

        console.log("Formatted notes with tags:", data);

        const formattedData = data.map(note => ({
          ...note,
          tags: Array.isArray(note.tags) ? note.tags : [],
        }));

        setNotes(formattedData);
      } catch (error) {
        setError("Error al obtener las notas. Inténtalo más tarde.");
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <NavBar className="mb-32"/>
      <div 
        className="p-6 bg-gray-800 rounded-lg shadow-md mx-auto mt-28"
        style={{ width: "70%", height: "80vh" }}
      >
        <h2 className="text-2xl font-bold text-white text-center flex-grow">Mis Notas</h2>
        
        <div className="flex justify-between items-center mb-4 mt-4">
          <Link href="/apps/notes/add">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Agregar Nueva Nota
            </button>
          </Link>          

          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-md placeholder-gray-400 focus:outline-none"
            style={{ maxWidth: '200px' }}
          />
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando notas...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ height: "calc(80vh - 150px)" }}>
            {currentNotes.map((note) => (
              <div key={note.id} className="bg-gray-700 rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${note.icon})` }}></div>
                
                <div className="p-4 flex-grow">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(note.tags) && note.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white">{note.title}</h3>
                  
                  <p className="text-gray-300 mt-2 text-sm line-clamp-3">
                    {note.content.replace(/(<([^>]+)>)/gi, "").substring(0, 100)}...
                  </p>
                </div>

                <div className="px-4 py-2 flex justify-between items-center text-gray-400 text-xs">
                  <span>{new Date(note.created_at).toLocaleDateString('es-ES')}</span>
                  <Link href={`/apps/notes/${note.id}`}>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-xs">
                      Ver Nota
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No se encontraron notas con el término de búsqueda.</p>
        )}

        {/* Paginación */}
        <div className="flex justify-center mt-12">
          {Array.from({ length: Math.ceil(filteredNotes.length / notesPerPage) }, (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 mx-1 rounded ${
                currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotesPage;
