"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import QuillEditor from "@/components/QuillEditor";
import { useDropzone } from "react-dropzone";
import NavBar from "@/components/NavBar";

const ChangeNote = () => {
  const router = useRouter();
  const { id } = useParams(); // Obtener el id desde la URL
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState(""); // Contenido de la nota (controlado)
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState("/notes/blog-img1.jpg");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [predefinedTags, setPredefinedTags] = useState([
    "Aerolíneas",
    "AFIP",
    "Bancos",
    "Claves en General",
    "Comidas",
    "Cripto",
    "Direcciones",
    "Frases",
    "Italia",
    "THI",
    "Visa Australia",
  ]);
  const dropdownRef = useRef(null);

  // Cargar datos de la nota al cargar la página
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes?id=${id}`);
        if (!response.ok) {
          throw new Error("Error al cargar la nota");
        }

        const data = await response.json();

        console.log("Content recibido:", data.content); // Debug para verificar el contenido recibido

        setNoteTitle(data.title || "");
        setNoteContent(data.content || ""); // Asegúrate de que sea HTML
        setSelectedIcon(data.icon || "/notes/blog-img1.jpg");
        setTags(Array.isArray(data.tags) ? data.tags : []);
        setImages(data.attachments?.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)) || []);
        setFiles(
          data.attachments?.filter((file) =>
            /\.(pdf|doc|docx|xls|xlsx)$/i.test(file)
          ) || []
        );
      } catch (error) {
        console.error("Error al cargar la nota:", error);
        alert("Hubo un problema al cargar la nota.");
      }
    };

    fetchNote();
  }, [id]);

  // Configuración para Dropzone de imágenes
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const filteredFiles = acceptedFiles.filter((file) => file.size > 0);
      setImages([...images, ...filteredFiles]);
    },
  });

  // Configuración para Dropzone de archivos
  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps } = useDropzone({
    accept: {
      "application/pdf": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "application/msword": [],
      "application/vnd.ms-excel": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
    onDrop: (acceptedFiles) => {
      const filteredFiles = acceptedFiles.filter((file) => file.size > 0);
      setFiles([...files, ...filteredFiles]);
    },
  });

  // Guardar cambios en la nota
  const handleSaveChanges = async () => {
    try {
      // Subir nuevas imágenes
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
            throw new Error("Error al subir la imagen");
          }
  
          const data = await response.json();
          return data.filePath;
        })
      );
  
      // Subir nuevos archivos
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          if (typeof file === "string") return file; // Mantener archivos existentes
          const formData = new FormData();
          formData.append("file", file);
  
          const response = await fetch("/api/uploadFiles", {
            method: "POST",
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error("Error al subir el archivo");
          }
  
          const data = await response.json();
          return data.filePath;
        })
      );
  
      const noteData = {
        id,             // Asegurarse de incluir el id
        userId,
        title: noteTitle,
        content: noteContent,
        attachments: [...uploadedImages, ...uploadedFiles],
        icon: selectedIcon,
        tags,
      };
  
      // Log para depuración
      console.log("Datos enviados al servidor:", noteData);
  
      const response = await fetch(`/api/notes?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });
  
      if (!response.ok) throw new Error("Error al guardar la nota");
  
      alert("Nota actualizada con éxito");
      router.push("/apps/notes");
    } catch (error) {
      console.error("Error al guardar la nota:", error);
      alert("Hubo un problema al guardar los cambios.");
    }
  };
  

  // Manejar etiquetas
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      if (!predefinedTags.includes(newTag)) {
        setPredefinedTags((prevTags) => [...prevTags, newTag]);
      }
      setNewTag("");
    }
    setShowDropdown(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagClick = (tag) => {
    setNewTag(tag);
    setShowDropdown(false);
  };

  // Cerrar el menú desplegable
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <NavBar className="mb-32" />
      <div className="flex justify-center space-x-4 mt-32 px-4">
        <div className="w-3/5 bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-white">Editar Nota</h2>

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
              <QuillEditor value={noteContent} onChange={setNoteContent} />
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
            <div className="mt-2">
              {images.map((file, index) => (
                <p key={index} className="text-gray-400">{typeof file === "string" ? file.split("/").pop() : file.name}</p>
              ))}
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
                <p key={index} className="text-gray-400">{typeof file === "string" ? file.split("/").pop() : file.name}</p>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveChanges}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Guardar Cambios
          </button>
        </div>

        <div className="w-2/5 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col space-y-4">
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
              <button onClick={handleAddTag} className="ml-2 bg-green-600 px-4 py-2 text-white rounded-md">
                Añadir
              </button>
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
                <span
                  key={index}
                  className="bg-blue-600 text-white px-2 py-1 rounded-full flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button onClick={() => handleRemoveTag(tag)} className="text-red-400 ml-1">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangeNote;