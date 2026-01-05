export function ProgressBar({ current, target, className = '' }) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-body-sm text-gray-600 text-mono">
          ${current.toLocaleString()} / ${target.toLocaleString()}
        </span>
        <span className="text-body-sm font-semibold text-emerald-600">
          {percentage}%
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
