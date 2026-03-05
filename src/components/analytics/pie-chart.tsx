'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PieChartProps {
  title: string
  description?: string
  data: Array<{
    name: string
    value: number
  }>
  colors?: string[]
  height?: number
  donut?: boolean
  showLabels?: boolean
}

const DEFAULT_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF6B6B',
]

export function PieChart({
  title,
  description,
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  donut = false,
  showLabels = true,
}: PieChartProps) {
  const renderLabel = (entry: any) => {
    if (!showLabels) return null
    return `${entry.name}: ${entry.value}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              label={showLabels ? renderLabel : undefined}
              outerRadius={donut ? 100 : 80}
              innerRadius={donut ? 60 : 0}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
