import React, { useState, useEffect } from 'react';

const Modal = ({ eventData, setEventData, handleSaveEvent, handleDeleteEvent, closeModal, selectedEvent }) => {
  const [selectedColor, setSelectedColor] = useState(eventData?.color || '#ff9f89'); // Color predeterminado

  useEffect(() => {
    if (selectedEvent) {
      setSelectedColor(selectedEvent.backgroundColor || '#ff9f89'); // Verificación de color
    }
  }, [selectedEvent]);

  // Manejar cambios en los inputs del modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar selección de color
  const handleColorSelection = (color) => {
    setSelectedColor(color);
    setEventData((prev) => ({ ...prev, color }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-lg">
        <h2 className="text-2xl mb-4">{selectedEvent ? 'Update Event' : 'Add Event'}</h2>

        <label htmlFor="title" className="block text-gray-700 mb-2">Título del Evento</label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Enter event title"
          value={eventData?.title || ''} // Usa el operador ? para evitar errores
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />

        <label htmlFor="startDate" className="block text-gray-700 mb-2">Start Date</label>
        <input
          type="date"
          name="startDate"
          id="startDate"
          value={eventData?.startDate || ''}  // Agregar operador opcional
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

        <div className="flex justify-between items-center mb-4">
          <label>Event Color:</label>
          <div className="flex space-x-2">
            {['#ff9f89', '#3a87ad', '#f56954', '#f39c12', '#00a65a'].map((color) => (
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