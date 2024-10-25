const InputField = ({ label, id, type, value, onChange, error }) => (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2" htmlFor={id}>{label}</label>
      <input 
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className={`border rounded w-full p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
  
  export default InputField;