export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button',
  className = '',
  disabled = false
}) {
  const baseClasses = variant === 'primary' 
    ? 'btn-primary' 
    : variant === 'secondary' 
    ? 'btn-secondary' 
    : 'btn-icon';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
