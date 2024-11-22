"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NavBar from "@/components/NavBar";

const NoteDetailPage = () => {
  const router = useRouter();
  const { id } = useParams(); // Obtener el id desde la URL
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null); // Estado para la imagen en el modal

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes?id=${id}`);
        if (!response.ok) {
          throw new Error("Error al cargar la nota");
        }

        const data = await response.json();

        // Asegurarnos de que `tags` sea un array y `attachments` también, aunque estén vacíos
        data.tags = Array.isArray(data.tags) ? data.tags : [];
        data.attachments = Array.isArray(data.attachments) ? data.attachments : [];

        setNote(data);
      } catch (error) {
        setError("Error al cargar la nota. Inténtalo más tarde.");
        console.error("Error fetching note:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  if (loading) return <p className="text-gray-400">Cargando nota...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Desestructuración de datos para facilitar el uso
  const { icon, title, content, tags, created_at, attachments } = note;

  const handleImageClick = (image) => {
    setModalImage(image);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <>
      <NavBar className="mb-32" />
      <div className="p-6 bg-gray-800 rounded-lg shadow-md mx-auto mt-24" style={{ width: "90%" }}>
        {/* Imagen de encabezado */}
        <div
          className="h-64 bg-cover bg-center rounded-lg"
          style={{ backgroundImage: `url(${icon})` }}
        ></div>

        {/* Tags y título */}
        <div className="mt-6">
          {/* Renderizar los tags solo si hay alguno */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>

        {/* Línea divisoria */}
        <hr className="my-4 border-gray-600" />

        {/* Contenido de la nota */}
        <div
          className="text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>

        {/* Línea divisoria */}
        <hr className="my-4 border-gray-600" />

        {/* Sección de imágenes */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Imágenes</h2>
          {attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {attachments.map((image, index) => (
                <div
                  key={index}
                  className="relative h-48 w-64 bg-gray-700 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => handleImageClick(image)}
                >
                  {/* Imagen */}
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = '/images-notes/placeholder.jpg')} // Placeholder si falla la carga
                  />
                  {/* Overlay en hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white text-sm">Click para expandir.</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Esta nota no tiene imágenes añadidas.</p>
          )}
        </div>

        {/* Modal para expandir imagen */}
        {modalImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-10/12 md:w-7/12 max-w-4xl">
              {/* Imagen expandida */}
              <img src={modalImage} alt="Imagen expandida" className="w-full h-auto max-h-[70vh]" />
              {/* Botón para cerrar */}
              <button
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-3 py-1 text-lg"
                onClick={closeModal}
              >
                X
              </button>
            </div>
          </div>
        )}

        {/* Fecha de creación */}
        <p className="text-gray-400 text-sm mt-6 text-right">
          {new Date(created_at).toLocaleDateString("es-ES")}
        </p>
      </div>
    </>
  );
};

export default NoteDetailPage;
