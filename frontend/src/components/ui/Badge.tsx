import { badgeColors } from "../../constants/badgeColors"

function Badge({ label }: { label: string }) {
    const cls = badgeColors[label] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
        {label}
      </span>
    )
  }

export default Badge;
  