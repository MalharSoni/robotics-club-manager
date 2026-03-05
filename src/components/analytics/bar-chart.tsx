'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BarChartProps {
  title: string
  description?: string
  data: any[]
  xKey: string
  bars: Array<{
    key: string
    color: string
    name: string
  }>
  height?: number
  yAxisLabel?: string
  xAxisLabel?: string
  stacked?: boolean
  horizontal?: boolean
}

export function BarChart({
  title,
  description,
  data,
  xKey,
  bars,
  height = 300,
  yAxisLabel,
  xAxisLabel,
  stacked = false,
  horizontal = false,
}: BarChartProps) {
  const ChartComponent = RechartsBarChart

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent
            data={data}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            {horizontal ? (
              <>
                <XAxis type="number" className="text-xs" />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  className="text-xs"
                  width={100}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xKey}
                  className="text-xs"
                  label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                />
                <YAxis
                  className="text-xs"
                  label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                fill={bar.color}
                name={bar.name}
                stackId={stacked ? 'stack' : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
