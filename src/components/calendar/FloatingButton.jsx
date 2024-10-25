import React from 'react';
import { TbCalendarPlus } from 'react-icons/tb'; // Importa el icono

const FloatingButton = ({ onClick }) => {
  return (
    <div
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <TbCalendarPlus size={24} />
    </div>
  );
};

export default FloatingButton;