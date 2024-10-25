import React, { useEffect } from 'react';

const Notification = ({ message, duration, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 left-4 bg-blue-500 text-white p-4 rounded shadow-lg">
      {message}
      <div className="h-1 bg-blue-700 mt-2" style={{ animation: `progress ${duration}ms linear` }} />
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Notification;