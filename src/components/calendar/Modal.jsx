import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

const Modal = ({ eventData, setEventData, handleSaveEvent, handleDeleteEvent, closeModal, selectedEvent }) => {
  const [selectedColor, setSelectedColor] = useState(eventData?.color || '#ff9f89');
  const [carpetas, setCarpetas] = useState([]);
  const [selectedCarpeta, setSelectedCarpeta] = useState('');
  const [newCarpeta, setNewCarpeta] = useState('');

  // State for emoji picker
  const [showTitleEmojiPicker, setShowTitleEmojiPicker] = useState(false);
  const titleEmojiPickerRef = useRef(null);

  // Predefined folders
  const predefinedCarpetas = ["Universidad", "Salud", "Desarrollo personal", "Deportes", "Biblioteca"];

  useEffect(() => {
    const fetchCarpetas = async () => {
      try {
        const response = await fetch('/api/carpetas');
        if (!response.ok) throw new Error('Error fetching folders');
        const data = await response.json();
        
        // Filter out any folders from the database that are already in predefinedCarpetas
        const uniqueDbCarpetas = data.filter(carpeta => !predefinedCarpetas.includes(carpeta));
        
        // Combine predefined folders with unique folders from database
        setCarpetas([...predefinedCarpetas, ...uniqueDbCarpetas]);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    fetchCarpetas();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setSelectedColor(selectedEvent.backgroundColor || '#ff9f89');
      setSelectedCarpeta(eventData.carpeta || '');
    }
  }, [selectedEvent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelection = (color) => {
    setSelectedColor(color);
    setEventData((prev) => ({ ...prev, color }));
  };

  useEffect(() => {
    setEventData((prev) => ({ ...prev, carpeta: selectedCarpeta }));
  }, [selectedCarpeta]);

  const handleEmojiClick = (emojiObject) => {
    setEventData((prev) => ({ ...prev, title: prev.title + emojiObject.emoji }));
  };

  const toggleEmojiPicker = () => {
    setShowTitleEmojiPicker((prev) => !prev);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (titleEmojiPickerRef.current && !titleEmojiPickerRef.current.contains(event.target)) {
        setShowTitleEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-lg">
        <h2 className="text-2xl mb-4">{selectedEvent ? 'Update Event' : 'Add Event'}</h2>

        <label htmlFor="title" className="block text-gray-700 mb-2">Título del Evento</label>
        <div className="relative">
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Enter event title"
            value={eventData?.title || ''}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border rounded"
          />
          <span
            onClick={toggleEmojiPicker}
            className="absolute right-2 top-2 cursor-pointer"
          >
            😊
          </span>
          {showTitleEmojiPicker && (
            <div ref={titleEmojiPickerRef} className="absolute z-10 top-10 right-0">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <label htmlFor="startDate" className="block text-gray-700 mb-2">Start Date</label>
        <input
          type="date"
          name="startDate"
          id="startDate"
          value={eventData?.startDate || ''}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />

        <label htmlFor="endDate" className="block text-gray-700 mb-2">End Date</label>
        <input
          type="date"
          name="endDate"
          id="endDate"
          value={eventData?.endDate || ''}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />

        <label htmlFor="startTime" className="block text-gray-700 mb-2">Start Time</label>
        <input
          type="time"
          name="startTime"
          id="startTime"
          value={eventData?.startTime || ''}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />

        <label htmlFor="endTime" className="block text-gray-700 mb-2">End Time</label>
        <input
          type="time"
          name="endTime"
          id="endTime"
          value={eventData?.endTime || ''}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />

        <label htmlFor="carpeta" className="block text-gray-700 mb-2">Carpeta</label>
        <select
          name="carpeta"
          id="carpeta"
          value={selectedCarpeta}
          onChange={(e) => setSelectedCarpeta(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          {carpetas.map((carpeta) => (
            <option key={carpeta} value={carpeta}>{carpeta}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nueva carpeta"
          value={newCarpeta}
          onChange={(e) => setNewCarpeta(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={() => {
            if (newCarpeta.trim()) {  
              const normalizedNewCarpeta = newCarpeta.trim();
              const folderExists = carpetas.some(
                carpeta => carpeta.toLowerCase() === normalizedNewCarpeta.toLowerCase()
              );
              
              if (!folderExists) {
                setCarpetas(prev => [...prev, normalizedNewCarpeta]);
                setSelectedCarpeta(normalizedNewCarpeta);
              }
              setNewCarpeta('');
            }
          }}
          className="bg-green-500 text-white p-2 rounded"
        >
          Añadir Carpeta
        </button>

        <div className="flex justify-between items-center mb-4 mt-4">
          <label>Event Color:</label>
          <div className="flex space-x-2">
            {['#ff9f89', '#3a87ad', '#a9a9a9', '#f39c12', '#00a65a'].map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full`}
                style={{ backgroundColor: color, border: selectedColor === color ? '2px solid black' : 'none' }}
                onClick={() => handleColorSelection(color)}
              >
                {selectedColor === color && <span className="text-white text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <button onClick={handleSaveEvent} className="bg-blue-500 text-white p-2 rounded mr-2">
            {selectedEvent ? 'Update Event' : 'Add Event'}
          </button>
          {selectedEvent && (
            <button onClick={handleDeleteEvent} className="bg-red-500 text-white p-2 rounded mr-2">
              Delete Event
            </button>
          )}
          <button onClick={closeModal} className="bg-gray-500 text-white p-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;