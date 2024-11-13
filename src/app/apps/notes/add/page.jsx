"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuillEditor from '@/components/QuillEditor';
import { useDropzone } from 'react-dropzone';
import NavBar from '@/components/NavBar';

const EditNote = () => {
  const router = useRouter();
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState("/notes/blog-img1.jpg"); // Imagen por defecto
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false); // Estado para controlar la galería

  const handleSaveNote = async () => {
    try {
      // Subir cada imagen y obtener las rutas
      const uploadedFiles = await Promise.all(
        attachments.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
  
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error('Error al subir la imagen');
          }
  
          const data = await response.json();
          return data.filePath; // Ruta de la imagen subida
        })
      );
  
      // Crear la nota con las rutas de las imágenes
      const noteData = {
        userId,
        title: noteTitle,
        content: noteContent,
        attachments: uploadedFiles, // Usar las rutas de las imágenes subidas
        icon: selectedIcon,
        tags,
      };
  
      // Guardar la nota
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });
  
      if (!response.ok) throw new Error('Error al guardar la nota');
      alert('Nota guardada con éxito');
      router.push('/apps/notes');
    } catch (error) {
      console.error('Error al guardar la nota:', error);
      alert('Hubo un problema al guardar la nota. Por favor, intenta nuevamente.');
    }
  };
  
  

  const onDrop = (acceptedFiles) => {
    setAttachments([...attachments, ...acceptedFiles]);
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <NavBar className="mb-32"/>
      <div className="flex justify-center space-x-4 mt-32 px-4">
        {/* Div para la nota (60%) */}
        <div className="w-3/5 bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-white">Nueva Nota</h2>
          
          {/* Título y Contenido en un div separado */}
          <div className="mb-4 p-4 bg-gray-700 rounded-md">
            <label className="text-white mb-2 block">Título</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Ingrese el título"
              className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500 mb-4"
            />

            <label className="text-white mb-2 block">Contenido</label>
            <div className="bg-gray-600 rounded-md overflow-hidden h-80 flex flex-col">
              <QuillEditor 
                value={noteContent} 
                onChange={setNoteContent} 
              />
            </div>
          </div>

          {/* Dropzone en un div separado */}
          <div className="mb-4 p-4 bg-gray-700 rounded-md">
            <label className="text-white mb-2 block">Agregar Imágenes</label>
            <div
              {...getRootProps()}
              className="p-4 border-2 border-dashed rounded-md cursor-pointer bg-gray-600 text-white"
            >
              <input {...getInputProps()} />
              <p>Arrastra y suelta archivos aquí, o haz clic para seleccionar</p>
            </div>
            <div className="mt-2">
              {attachments.map((file, index) => (
                <p key={index} className="text-gray-400">{file.name}</p>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveNote}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Guardar Nota
          </button>
        </div>

        {/* Div para la miniatura y etiquetas (40%) */}
        <div className="w-2/5 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col space-y-4">
          {/* Icono en un div que ocupa el 50% superior */}
          <div className="flex-1 p-4 bg-gray-700 rounded-md flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-white self-start">Ícono</h3>
            {!isGalleryOpen ? (
              <div className="flex flex-col items-center">
                {/* Imagen seleccionada en grande */}
                <img
                  src={selectedIcon}
                  alt="Ícono seleccionado"
                  className="w-48 h-48 cursor-pointer rounded-md border-2 border-blue-500 transition-opacity duration-300"
                  onClick={() => setIsGalleryOpen(true)} // Abre la galería al hacer clic
                />
                <p className="text-gray-400 mt-2">Haz click en la imagen para elegir otras opciones de miniatura.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-4 transition-opacity duration-300">
                {[...Array(10)].map((_, i) => (
                  <img
                    key={i}
                    src={`/notes/blog-img${i + 1}.jpg`}
                    alt={`Ícono ${i + 1}`}
                    className="w-16 h-16 cursor-pointer rounded-md border-2 border-transparent hover:border-blue-500 transition-transform duration-200"
                    onClick={() => {
                      setSelectedIcon(`/notes/blog-img${i + 1}.jpg`); // Cambia la imagen seleccionada
                      setIsGalleryOpen(false); // Cierra la galería
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Etiqueta en un div que ocupa el 50% inferior */}
          <div className="flex-1 p-4 bg-gray-700 rounded-md">
            <h3 className="text-xl font-bold mb-4 text-white">Etiqueta</h3>
            <div className="flex mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Agregar etiqueta"
                className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
              />
              <button onClick={handleAddTag} className="ml-2 bg-green-600 px-4 py-2 text-white rounded-md">Añadir</button>
            </div>
            <div className="flex flex-wrap space-x-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded-full flex items-center space-x-1">
                  <span>{tag}</span>
                  <button onClick={() => handleRemoveTag(tag)} className="text-red-400 ml-1">✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default EditNote;
