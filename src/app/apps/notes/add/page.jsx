"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuillEditor from '@/components/QuillEditor';
import { useDropzone } from 'react-dropzone';
import NavBar from '@/components/NavBar';
import EmojiPicker from 'emoji-picker-react'; // Import the emoji picker

const EditNote = () => {
  const router = useRouter();
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [images, setImages] = useState([]); // Estado para imágenes
  const [files, setFiles] = useState([]); // Estado para archivos
  const [selectedIcon, setSelectedIcon] = useState("/notes/blog-img1.jpg");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [predefinedTags, setPredefinedTags] = useState([
    "Aerolíneas", "AFIP", "Bancos", "Claves en General", "Comidas",
    "Cripto", "Direcciones", "Frases", "Italia", "THI", "Visa Australia"
  ]); // Estado para tags dinámicos

  //Emoji Picker para el titulo
  const [showTitleEmojiPicker, setShowTitleEmojiPicker] = useState(false); // State to control emoji picker visibility
  const titleEmojiPickerRef = useRef(null); // Ref for emoji picker

  //Emoji Picker para el contenido  
  const [showContentEmojiPicker, setShowContentEmojiPicker] = useState(false); // Estado para el emoji picker del contenido
  const contentEmojiPickerRef = useRef(null); // Ref para el emoji picker del contenido

  const dropdownRef = useRef(null); // Ref para el menú desplegable

  // Obtener tags de la base de datos al cargar la página
  useEffect(() => {
    const fetchTagsFromDB = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Error al cargar tags');
        const dbTags = await response.json();
  
        //console.log("Tags desde la base de datos:", dbTags);
  
        setPredefinedTags((prevTags) => {
          const mergedTags = [...new Set([...prevTags, ...dbTags])];
          //console.log("Tags fusionados:", mergedTags);
          return mergedTags;
        });
      } catch (error) {
        console.error('Error al cargar tags desde la base de datos:', error);
      }
    };
  
    fetchTagsFromDB();
  }, []);
  

  // Configuración de useDropzone para imágenes
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] }, // Aceptar solo imágenes
    onDrop: (acceptedFiles) => {
      const filteredFiles = acceptedFiles.filter(file => file.size > 0); // Evitar archivos vacíos
      setImages([...images, ...filteredFiles]); // Actualizar solo imágenes
    },
  });

  // Configuración de useDropzone para archivos
  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps } = useDropzone({
    accept: {
      'application/pdf': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/msword': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'text/plain': [], // Añadir soporte para archivos .txt
    },
    onDrop: (acceptedFiles) => {
      const filteredFiles = acceptedFiles.filter(file => file.size > 0); // Evitar archivos vacíos
      setFiles([...files, ...filteredFiles]); // Actualizar solo archivos
    },
  });

  const handleSaveNote = async () => {
    try {
      console.log("Iniciando subida de imágenes y archivos...");
  
      // Subir imágenes
      const uploadedImages = await Promise.all(
        images.map(async (file) => {
          if (typeof file === "string") return file; // Mantener imágenes existentes
          const formData = new FormData();
          formData.append("file", file);
      
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
      
          if (!response.ok) {
            throw new Error(`Error al subir la imagen: ${file.name}`);
          }
      
          const data = await response.json();
          console.log("Imagen subida correctamente:", data.filePath); // El backend devuelve `filePath`
          return data.filePath || null; // Usar el campo correcto de la respuesta
        })
      );
  
      console.log("Imágenes subidas:", uploadedImages);
  
      // Subir archivos
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          if (typeof file === "string") return file; // Mantener los archivos existentes
          const formData = new FormData();
          formData.append("file", file);
  
          const response = await fetch("/api/uploadFiles", {
            method: "POST",
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error(`Error al subir el archivo: ${file.name}`);
          }
  
          const data = await response.json();
          console.log("Archivo subido correctamente:", data.files?.[0]);
          return data.files?.[0] || null;
        })
      );
  
      console.log("Archivos subidos:", uploadedFiles);
  
      // Crear los datos de la nota
      const noteData = {
        userId,
        title: noteTitle,
        content: noteContent,
        attachments: uploadedImages.filter((path) => path !== null), // Asegurar que no haya valores `null`
        files: uploadedFiles.filter((path) => path !== null),
        icon: selectedIcon,
        tags,
      };      
  
      console.log("Datos a enviar al servidor:", noteData);
  
      // Guardar la nota
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });
  
      if (!response.ok) {
        throw new Error("Error al guardar la nota");
      }
  
      console.log("Nota guardada correctamente en el servidor");
      alert("Nota guardada con éxito");
      router.push("/apps/notes");
    } catch (error) {
      console.error("Error al guardar la nota:", error);
      alert("Hubo un problema al guardar la nota. Por favor, intenta nuevamente.");
    }
  };
  
  

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]); // Agregar el tag a la nota actual
      if (!predefinedTags.includes(newTag)) {
        setPredefinedTags((prevTags) => [...prevTags, newTag]); // Agregar a predefinedTags
      }
      setNewTag('');
    }
    setShowDropdown(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagClick = (tag) => {
    setNewTag(tag);
    setShowDropdown(false);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Cerrar el menú desplegable al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        titleEmojiPickerRef.current && !titleEmojiPickerRef.current.contains(event.target) && // Usa titleEmojiPickerRef
        contentEmojiPickerRef.current && !contentEmojiPickerRef.current.contains(event.target) // Usa contentEmojiPickerRef
      ) {
        setShowDropdown(false);
        setShowTitleEmojiPicker(false);
        setShowContentEmojiPicker(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiObject, event) => {
    setNoteTitle((prevTitle) => prevTitle + emojiObject.emoji);
  };

  const handleContentEmojiClick = (emojiObject, event) => {
    setNoteContent((prevContent) => prevContent + emojiObject.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowTitleEmojiPicker((prev) => !prev); // Asegúrate de que esto esté usando showTitleEmojiPicker
  };

  const toggleContentEmojiPicker = () => {
    setShowContentEmojiPicker((prev) => !prev);
  };

  return (
    <>
      <NavBar className="mb-32" />
      <div className="flex justify-center space-x-4 mt-32 px-4">
        <div className="w-3/5 bg-gray-800 p-6 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Nueva Nota</h2>

          <div className="mb-4 p-4 bg-gray-700 rounded-md">
            <label className="text-white mb-2 block">Título</label>
            <div className="relative">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Ingrese el título"
                className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500 mb-4"
              />
              <span
                onClick={toggleEmojiPicker}
                className="absolute right-2 top-2 cursor-pointer"
              >
                😊
              </span>
              {showTitleEmojiPicker && ( // Cambia showEmojiPicker a showTitleEmojiPicker
                <div ref={titleEmojiPickerRef} className="absolute z-10 top-10 right-0">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            <label className="text-white mb-2 block">Contenido</label>
            <div className="bg-gray-600 rounded-md overflow-hidden h-80 flex flex-col relative">
              <QuillEditor
                value={noteContent}
                onChange={setNoteContent}
              />
              <span
                onClick={toggleContentEmojiPicker}
                className="absolute right-2 top-2 cursor-pointer"
              >
                😊
              </span>
              {showContentEmojiPicker && (
                <div ref={contentEmojiPickerRef} className="absolute z-10 top-10 right-0">
                  <EmojiPicker onEmojiClick={handleContentEmojiClick} />
                </div>
              )}
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-700 rounded-md">
            <label className="text-white mb-2 block">Agregar Imágenes</label>
            <div
              {...getRootProps()}
              className="p-4 border-2 border-dashed rounded-md cursor-pointer bg-gray-600 text-white"
            >
              <input {...getInputProps()} />
              <p>Arrastra y suelta imágenes aquí, o haz clic para seleccionar.</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4"> {/* Grid para mostrar miniaturas */}
              {images.map((file, index) => {
                const isImage = file.type?.startsWith('image/') || file.name.endsWith('.webp'); // Verificar si es imagen

                return isImage ? (
                  <div key={index} className="relative group">
                    {/* Imagen */}
                    <img
                      src={file.url || URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-48 object-cover rounded-md shadow-md cursor-pointer"
                      onClick={() => handleImageClick(file)} // Lógica para ver la imagen ampliada
                    />
                    {/* Botón para eliminar */}
                    <button
                      onClick={() => handleRemoveImage(index)} // Lógica para eliminar la imagen
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    {/* Nombre del archivo */}
                    <p className="text-gray-400 mt-1 text-sm truncate">{file.name}</p>
                  </div>
                ) : (
                  <div key={index} className="file-preview-container">
                    <p className="text-gray-400">{file.name}</p>
                  </div>
                );
              })}
            </div>
          </div>



          <div className="mb-4 p-4 bg-gray-700 rounded-md">
            <label className="text-white mb-2 block">Agregar Archivos</label>
            <div
              {...getFileRootProps()}
              className="p-4 border-2 border-dashed rounded-md cursor-pointer bg-gray-600 text-white"
            >
              <input {...getFileInputProps()} />
              <p>Arrastra y suelta archivos aquí, o haz clic para seleccionar</p>
            </div>
            <div className="mt-2">
              {files.map((file, index) => (
                <p key={index} className="text-gray-400">{file.name}</p>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveNote}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Crear Nota
          </button>
        </div>

        <div className="w-2/5 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col space-y-4 mb-12">
          <div className="flex-1 p-4 bg-gray-700 rounded-md flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-white self-start">Ícono</h3>
            {!isGalleryOpen ? (
              <div className="flex flex-col items-center">
                <img
                  src={selectedIcon}
                  alt="Ícono seleccionado"
                  className="w-48 h-48 cursor-pointer rounded-md border-2 border-blue-500 transition-opacity duration-300"
                  onClick={() => setIsGalleryOpen(true)}
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
                      setSelectedIcon(`/notes/blog-img${i + 1}.jpg`);
                      setIsGalleryOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 p-4 bg-gray-700 rounded-md relative" ref={dropdownRef}>
            <h3 className="text-xl font-bold mb-4 text-white">Etiqueta</h3>
            <div className="flex mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => {
                  setNewTag(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Agregar etiqueta"
                className="w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500"
              />
              <button onClick={handleAddTag} className="ml-2 bg-green-600 px-4 py-2 text-white rounded-md">Añadir</button>
            </div>

            {showDropdown && (
              <ul className="absolute z-10 bg-gray-600 text-white w-96 rounded-md shadow-lg max-h-64 overflow-y-auto">
                {predefinedTags
                  .filter((tag) => tag.toLowerCase().includes(newTag.toLowerCase()))
                  .map((tag, index) => (
                    <li
                      key={index}
                      onClick={() => handleTagClick(tag)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-500"
                    >
                      {tag}
                    </li>
                  ))}
              </ul>
            )}

            <div className="flex flex-wrap space-x-2 mt-2">
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
