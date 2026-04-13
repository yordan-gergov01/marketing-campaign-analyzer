function Select<T extends string>({
    label, options, value, onChange,
  }: { label: string; options: T[]; value: T; onChange: (v: T) => void }) {
    return (
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 capitalize"
        >
          {options.map((o) => (
            <option key={o} value={o} className="capitalize">{o}</option>
          ))}
        </select>
      </div>
    )
  }

export default Select;