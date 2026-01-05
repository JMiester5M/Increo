export function Card({ children, variant = 'default', className = '', onClick }) {
  const baseStyles = {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    border: '1px solid #F1F5F9'
  };
  
  const baseClasses = variant === 'goal' 
    ? 'card card-goal' 
    : variant === 'expense' 
    ? 'card-expense' 
    : 'card';
  
  return (
    <div 
      className={`${baseClasses} ${className}`}
      style={baseStyles}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
