// components/QuillEditor.jsx
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const QuillEditor = ({ value, onChange }) => {
  const [editorValue, setEditorValue] = useState(value || "");

  // Sincronizar cambios en la prop `value` con el estado interno
  useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  const handleChange = (content) => {
    setEditorValue(content);
    onChange(content); // Notificar al padre del cambio
  };

  return (
    <div className="bg-white rounded-md p-2 flex-1 flex flex-col">
      <ReactQuill
        value={editorValue}
        onChange={handleChange}
        theme="snow"
        placeholder="Escribe tu nota aquí..."
        className="flex-1"
      />
    </div>
  );
};

export default QuillEditor;
