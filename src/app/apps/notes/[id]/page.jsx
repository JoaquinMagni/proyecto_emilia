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
  
        // Verifica cómo llegan los tags
        console.log("Tags recibidos:", data.tags);
  
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
    if (!image || !/\.(jpg|jpeg|png|gif|webp)$/i.test(image)) {
      console.error("Archivo no válido para el modal:", image);
      return;
    }
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
        {Array.isArray(tags) && tags.length > 0 ? (
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
        ) : (
          <p className="text-gray-400">No hay etiquetas asociadas a esta nota.</p>
        )}
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>


        <hr className="my-4 border-gray-600" />

        {/* Contenido de la nota */}
        <div
          className="text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>

        <hr className="my-4 border-gray-600" />

        {/* Sección de imágenes y archivos */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Imágenes y Archivos</h2>
          {attachments.length > 0 || note.files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Iterar sobre attachments (imágenes) */}
              {attachments.map((attachment, index) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
                const thumbnail = isImage ? attachment : "/images-notes/placeholder.jpg";
                const fileName = attachment.split("/").pop();

                return (
                  <div
                    key={`attachment-${index}`}
                    className="relative h-48 w-64 rounded-lg overflow-hidden group bg-gray-700"
                  >
                    <img
                      src={thumbnail}
                      alt={fileName}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/images-notes/placeholder.jpg")}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = attachment;
                          link.download = fileName; // Usa el nombre del archivo para la descarga
                          link.click();
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                      >
                        Descargar
                      </button>
                    </div>
                    <p className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-sm text-center py-1 truncate">
                      {fileName}
                    </p>
                  </div>
                );
              })}



              {/* Iterar sobre files (archivos no imágenes) */}
              {note.files.map((file, index) => {
                // Determinar el tipo de archivo
                const isPdf = /\.pdf$/i.test(file);
                const isWord = /\.(doc|docx)$/i.test(file);
                const isExcel = /\.(xls|xlsx)$/i.test(file);
                const isPowerPoint = /\.(ppt|pptx)$/i.test(file);
                const isText = /\.txt$/i.test(file);

                // Seleccionar la miniatura basada en el tipo de archivo
                let thumbnail = "/images-notes/placeholder.jpg";
                if (isPdf) thumbnail = "/pdf.png";
                else if (isWord) thumbnail = "/word.png";
                else if (isExcel) thumbnail = "/excel.png";
                else if (isPowerPoint) thumbnail = "/powerpoint.png";
                else if (isText) thumbnail = "/notepad.png";

                const fileName = file.split("/").pop();

                return (
                  <div
                    key={`file-${index}`}
                    className="relative h-48 w-64 rounded-lg overflow-hidden group bg-gray-700"
                  >
                    <img
                      src={thumbnail}
                      alt={fileName}
                      className="w-full h-full object-contain"
                      onError={(e) => (e.target.src = "/images-notes/placeholder.jpg")}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">                      
                      <button
                        onClick={() => window.open(file, "_blank")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                      >
                        Descargar
                      </button>
                    </div>
                    <p className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-sm text-center py-1 truncate">
                      {fileName}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">Esta nota no tiene archivos añadidos.</p>
          )}
        </div>

        {/* Modal para expandir imagen */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closeModal} // Cerrar modal al hacer clic fuera de la imagen
          >
            <div
              className="relative w-10/12 md:w-7/12 max-w-4xl"
              onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer clic dentro del modal
            >
              <img
                src={modalImage}
                alt="Imagen expandida"
                className="w-full h-auto max-h-[70vh]"
              />
              <button
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-3 py-1 text-lg"
                onClick={closeModal}
              >
                X
              </button>
            </div>
          </div>
        )}




        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => router.push(`/apps/notes/edit/${id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            Editar Nota
          </button>
          <p className="text-gray-400 text-sm">
            {new Date(created_at).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>
    </>
  );
};

export default NoteDetailPage;
