// src/components/User.js
"use client";

import { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';

const User = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  if (!user) return null;

  return (
    <div className="relative">
      <img
        src="/main/profiles/user.jpg"
        alt="User Profile"
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={toggleMenu}
      />
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-4">
          <p className="font-bold">{user.nombre_usuario}</p>
          <p>{user.correo}</p>
          <button onClick={logout} className="mt-2 text-red-500">Logout</button>
        </div>
      )}
    </div>
  );
};

export default User;
