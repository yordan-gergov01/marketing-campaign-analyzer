import { NavLink, useLocation } from "react-router-dom"
import { NAV } from "../../constants/nav";

function Header() {
const { pathname } = useLocation()
const current = NAV.find((n) =>
  n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)
)

return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold text-lg tracking-tight">AdAnalyzer</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-400 text-sm">{current?.label}</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`
              }
            >
              <span className="text-xs">{n.icon}</span>
              <span className="hidden sm:inline">{n.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
    )
}

export default Header;