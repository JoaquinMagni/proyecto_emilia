const SubmitButton = ({ text, variant = "primary", type = "button", onClick, className = "" }) => {
  // Estilos para los diferentes tipos de botones
  const primaryStyle = "bg-blue-500 text-white hover:bg-blue-700";
  const secondaryStyle = "bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white";

  // Combinamos las clases predeterminadas con las clases adicionales que se pasan como `className`
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`w-full py-2 rounded transition ${variant === "primary" ? primaryStyle : secondaryStyle} ${className}`}
    >
      {text}
    </button>
  );
};

export default SubmitButton;