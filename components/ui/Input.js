export function Input({ 
  label, 
  id, 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  required = false,
  className = '',
  options = []
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="input"
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="input"
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? '0.01' : undefined}
          inputMode={type === 'number' ? 'decimal' : undefined}
        />
      )}
    </div>
  );
}
