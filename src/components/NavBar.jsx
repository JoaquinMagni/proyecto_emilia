import React, { useState } from 'react';
import LanguageSwitcher from './buttons/LanguajeSwitcher';
import ThemeSwitcher from './buttons/ThemeSwitcher';
import User from './User'; // Importar el componente User
import FolderPanel from './FolderPanel';

const NavBar = ({ showFolderPanel }) => {
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const toggleAppsMenu = () => {
    setIsAppsMenuOpen(!isAppsMenuOpen);
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full pl-8 py-4 flex items-center justify-between bg-blue-300 dark:bg-gray-800">
      {/* Sección de apps y enlaces */}
      <div className="flex items-center space-x-4">
        {showFolderPanel && ( // Condicionalmente renderizar el botón y el FolderPanel
          <>
            <button onClick={togglePanel} className="flex items-center space-x-2">
              <img src="/menu.png" alt="Menu" className="w-6 h-6" />
            </button>
            {isPanelOpen && (
              <div onClick={togglePanel} className="relative">
                <FolderPanel onClose={togglePanel} />
              </div>
            )}
          </>
        )}
        <a href="/" className="hover:text-blue-600 dark:hover:text-blue-300">Home</a> {/* Enlace a la página principal */}
        <div className="relative">
          <button onClick={toggleAppsMenu} className="flex items-center space-x-2 ml-8">
            <span>Apps</span>
            <span>▼</span>
          </button>
          {isAppsMenuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-blue-500 dark:bg-gray-700 shadow-lg rounded-lg">
              <ul>
                <li className="p-2 hover:bg-blue-400 dark:hover:bg-gray-600">
                  <a href="/apps/events">Eventos</a>
                </li>
                <li className="p-2 hover:bg-blue-400 dark:hover:bg-gray-600">
                  <a href="/apps/calendar">Calendar</a>
                </li>
                <li className="p-2 hover:bg-blue-400 dark:hover:bg-gray-600">
                  <a href="/apps/notes">Notes</a>
                </li>
              </ul>
            </div>
          )}
        </div>
        <a href="/apps/events" className="hover:text-blue-600 dark:hover:text-blue-300">Eventos</a>
        <a href="/apps/calendar" className="hover:text-blue-600 dark:hover:text-blue-300">Calendar</a>
        <a href="/apps/notes" className="hover:text-blue-600 dark:hover:text-blue-300">Notes</a>
      </div>

      {/* Sección de usuario, idioma y tema */}
      <div className="flex items-center space-x-6 mr-8">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <User /> {/* Aquí añadimos el componente User */}
      </div>
    </nav>
  );
};

export default NavBar;