"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NavBar from '@/components/NavBar';

const NoteDetailPage = () => {
  const router = useRouter();
  const { id } = useParams(); // Obtener el id desde la URL
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const { icon, title, content, tags, created_at } = note;

  return (
    <>
      <NavBar className="mb-32" />
      <div className="p-6 bg-gray-800 rounded-lg shadow-md mx-auto mt-24" style={{ width: "90%" }}>
        {/* Imagen de encabezado */}
        <div className="h-64 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(${icon})` }}></div>
        
        {/* Tags y título */}
        <div className="mt-6">
          {/* Renderizar los tags solo si hay alguno */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
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
        <div className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }}></div>

        {/* Fecha de creación */}
        <p className="text-gray-400 text-sm mt-6 text-right">
          {new Date(created_at).toLocaleDateString('es-ES')}
        </p>
      </div>
    </>
  );
};

export default NoteDetailPage;
