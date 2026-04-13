function TabBar<T extends string>({
    tabs,
    active,
    onChange,
  }: {
    tabs: { value: T; label: string }[]
    active: T
    onChange: (v: T) => void
  }) {
    return (
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active === t.value
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    )
  }
  
export default TabBar;