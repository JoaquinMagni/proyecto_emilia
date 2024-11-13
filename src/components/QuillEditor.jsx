
// components/QuillEditor.jsx
"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Carga dinámica de react-quill para evitar SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const QuillEditor = ({ value, onChange }) => {
  const [editorValue, setEditorValue] = useState(value || '');

  const handleChange = (content) => {
    setEditorValue(content);
    onChange(content); // Pasa el contenido HTML al padre para que se guarde
  };

  return (
    <div className="bg-white rounded-md p-2 flex-1 flex flex-col"> {/* Contenedor flexible */}
      <ReactQuill 
        value={editorValue} 
        onChange={handleChange} 
        theme="snow"
        placeholder="Escribe tu nota aquí..." 
        className="flex-1" // Asegura que ReactQuill ocupe toda la altura disponible
      />
    </div>
  );
};

export default QuillEditor;
