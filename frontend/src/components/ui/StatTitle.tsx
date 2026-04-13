import Card from "./Card";

function StatTile({
    label, value, sub,
  }: { label: string; value: string; sub?: string }) {
    return (
      <Card>
        <p className="text-xs text-zinc-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </Card>
    )
  }


export default StatTile;