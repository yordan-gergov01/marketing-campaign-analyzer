import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/ui/Card";
import SectionTitle from "../../components/ui/SectionTitle";
import { AnalysisResponse } from "../../types/api-types";
import { CHART_TOOLTIP_STYLE } from "../../constants/dashboardConstants";

function ChartsGrid({ data }: { data: AnalysisResponse }) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>Spend by campaign</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.charts.spend_by_campaign} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => `€${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={130} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: '#fff' }} formatter={(v: number) => [`€${v.toLocaleString()}`, 'Spend']} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.charts.spend_by_campaign.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? '#10b981' : '#059669'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
  
        <Card>
          <SectionTitle>CTR vs account average</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.charts.ctr_by_campaign} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={130} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number, name: string) => [`${v}%`, name === 'ctr' ? 'CTR' : 'Avg']} />
              <ReferenceLine x={data.avg_ctr} stroke="#f59e0b" strokeDasharray="3 3" />
              <Bar dataKey="ctr" radius={[0, 4, 4, 0]}>
                {data.charts.ctr_by_campaign.map((d, i) => (
                  <Cell key={i} fill={d.ctr >= data.avg_ctr ? '#10b981' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
  
        <Card>
          <SectionTitle>Budget efficiency score</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.charts.efficiency_by_campaign} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#71717a' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={130} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [v, 'Score /100']} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {data.charts.efficiency_by_campaign.map((d, i) => (
                  <Cell key={i} fill={d.score >= 60 ? '#10b981' : d.score >= 35 ? '#f59e0b' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
  
        <Card>
          <SectionTitle>ROAS by campaign</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.charts.roas_by_campaign} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => `${v}x`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={130} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v}x`, 'ROAS']} />
              <ReferenceLine x={1} stroke="#f43f5e" strokeDasharray="3 3" />
              <Bar dataKey="roas" radius={[0, 4, 4, 0]}>
                {data.charts.roas_by_campaign.map((d, i) => (
                  <Cell key={i} fill={d.roas >= 2 ? '#10b981' : d.roas >= 1 ? '#f59e0b' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    )
  }

export default ChartsGrid;