export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex items-center gap-3 text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}


