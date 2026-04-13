function Spinner({ className = '' }: { className?: string }) {
    return (
      <div className={`animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400 ${className}`} />
    )
  }

export default Spinner;