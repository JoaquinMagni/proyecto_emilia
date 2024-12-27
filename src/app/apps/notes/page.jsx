"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 6;
  const [allTags, setAllTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
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

        const formattedData = data.map((note) => ({
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

  const handleDelete = async (noteId) => {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar esta nota?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la nota");
      }

      alert("Nota eliminada correctamente");
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error al eliminar la nota:", error);
      alert("Hubo un problema al eliminar la nota.");
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      (searchTerm === "" ||
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (searchTag === "" || note.tags.some((tag) => tag.toLowerCase().includes(searchTag.toLowerCase())))
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchTag]);

  const totalNotes = filteredNotes.length;
  const totalPages = Math.max(1, Math.ceil(totalNotes / notesPerPage));
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchTagsFromDB = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Error al cargar tags');
        const dbTags = await response.json();
        const predefinedTags = [
          "Aerolíneas", "AFIP", "Bancos", "Claves en General", "Comidas",
          "Cripto", "Direcciones", "Frases", "Italia", "THI", "Visa Australia"
        ];
        const mergedTags = [...new Set([...predefinedTags, ...dbTags])];
        setAllTags(mergedTags);
      } catch (error) {
        console.error('Error al cargar tags desde la base de datos:', error);
      }
    };
  
    fetchTagsFromDB();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.tag-dropdown') && // Verifica clic fuera del menú
        !event.target.closest('.toggle-dropdown') // Verifica clic fuera de la flecha
      ) {
        setShowTagDropdown(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <NavBar showFolderPanel={false} className="mb-32" />
      <div className="p-6 bg-gray-800 rounded-lg shadow-md mx-auto mt-28 mb-4" style={{ width: "70%", height: "80vh" }}>
        <h2 className="text-2xl font-bold text-white text-center flex-grow">Mis Notas</h2>

        <div className="flex justify-between items-center mb-4 mt-8">
          <Link href="/apps/notes/add">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Agregar Nueva Nota
            </button>
          </Link>

          <div className="flex space-x-4">
            <div className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-md relative">
              <img src="/filter.png" alt="Filtro" className="h-5 w-5 mr-2" />
              <input
                type="text"
                placeholder="Buscar por etiquetas..."
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                onFocus={() => setShowTagDropdown(true)}
                className="bg-gray-700 text-white placeholder-gray-400 focus:outline-none flex-grow"
              />
              <span
                onClick={() => setShowTagDropdown((prev) => !prev)}
                className="cursor-pointer ml-2 toggle-dropdown"
              >
                ▼
              </span>
              {showTagDropdown && (
                <ul className="absolute left-0 top-full z-10 bg-gray-600 text-white w-full rounded-md shadow-lg max-h-64 overflow-y-auto mt-1 tag-dropdown">
                  {allTags.map((tag, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSearchTag(tag);
                        setShowTagDropdown(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-500"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-md">
              <img src="/lupa.png" alt="Lupa" className="h-5 w-5 mr-2" />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white placeholder-gray-400 focus:outline-none flex-grow"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando notas...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {currentNotes.map((note) => (
              <div key={note.id} className="bg-gray-700 rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${note.icon})` }}></div>

                <div className="p-4 flex-grow">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(note.tags) &&
                      note.tags.map((tag, index) => (
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
                  <span>{new Date(note.created_at).toLocaleDateString("es-ES")}</span>
                  <div className="flex gap-2">
                    <Link href={`/apps/notes/${note.id}`}>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-xs">
                        Ver Nota
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No se encontraron notas con el término de búsqueda.</p>
        )}
      </div>
      <div className="flex justify-center mt-4 mb-6">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`px-4 py-2 mx-1 rounded ${
              currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default NotesPage;
