import { ReactNode } from "react";

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
      <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 ${className}`}>
        {children}
      </div>
    )
  }

export default Card;