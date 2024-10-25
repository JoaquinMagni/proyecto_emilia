const SelectField = ({ label, id, value, onChange, error, options }) => (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2" htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`border rounded w-full p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
  
  export default SelectField;