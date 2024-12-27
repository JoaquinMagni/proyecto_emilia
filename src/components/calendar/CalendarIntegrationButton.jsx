import React, { useState } from 'react';

function CalendarIntegrationButton({ onClick, logoSrc, buttonText, guideSteps, images, eventColor, initialUrl }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [calendarUrl, setCalendarUrl] = useState(initialUrl || ''); // Usa initialUrl

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white mb-24 px-4 py-2 rounded-full flex items-center justify-center space-x-2 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 ease-in-out mx-auto w-1/6"
      >
        {buttonText}
        <img src={logoSrc} alt={`${buttonText} Logo`} className="ml-2 w-4 h-4" />
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-md w-full max-w-2xl h-[85vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="mt-2">
              <h2 className="text-lg font-semibold text-gray-800">Guía de integración:</h2>
              <p className="text-lg font-semibold text-gray-600 text-center mt-4">{guideSteps[currentImageIndex]}</p>
              <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-0 bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 focus:outline-none"
                  >
                    ←
                  </button>
                )}

                <img
                  src={images[currentImageIndex]}
                  alt={`Guía paso ${currentImageIndex + 1}`}
                  className="w-auto h-auto max-w-full max-h-[80%] mx-auto rounded-md shadow-md object-contain cursor-zoom-in"
                  onClick={() => setZoomedImage(images[currentImageIndex])}
                />

                {currentImageIndex < images.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-0 bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 focus:outline-none"
                  >
                    →
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-lg font-semibold">Ingresa la URL de iCal:</h2>
            <input
              type="text"
              placeholder="Ingrese su URL de iCal"
              className="w-full p-2 border rounded mb-4"
              value={calendarUrl || initialUrl} // Usa initialUrl si calendarUrl está vacío
              onChange={(e) => setCalendarUrl(e.target.value)}
            />
            <button
              onClick={() => onClick(calendarUrl, eventColor)} // Pasa el color junto con la URL
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Cargar Eventos
            </button>
          </div>
        </div>
      )}

      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Imagen ampliada"
            className="max-w-[90%] max-h-[90%] rounded-md shadow-lg object-contain cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default CalendarIntegrationButton;