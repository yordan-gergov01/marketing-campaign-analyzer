import { ReactNode } from "react";

function SectionTitle({ children }: { children: ReactNode }) {
    return <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">{children}</h2>
  }

export default SectionTitle;