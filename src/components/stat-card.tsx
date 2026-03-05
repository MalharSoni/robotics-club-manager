interface StatCardProps {
  label: string
  value: string | number
  meta?: string
  accent?: 'yellow' | 'black' | 'red'
  icon?: React.ReactNode
}

export function StatCard({ label, value, meta, accent, icon }: StatCardProps) {
  const borderColor = accent === 'yellow' ? 'var(--yellow)' : accent === 'black' ? 'var(--black)' : accent === 'red' ? '#EF4444' : undefined

  return (
    <div
      className="bg-white border border-[var(--gray-3)] rounded-[10px] p-[16px_14px] flex flex-col gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.05)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,.10)] relative overflow-hidden"
      style={borderColor ? { borderTop: `3px solid ${borderColor}` } : {}}
    >
      {icon && (
        <div className="absolute top-3 right-3 opacity-20" style={{ color: 'var(--gray-2)' }}>
          {icon}
        </div>
      )}
      <div className="text-[10px] font-[700] uppercase tracking-[0.05em] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--gray-1)' }}>
        {label}
      </div>
      <div className="text-[28px] font-[900] leading-none" style={{ color: 'var(--black)', letterSpacing: '-.03em' }}>
        {value}
      </div>
      {meta && (
        <div className="text-[11.5px]" style={{ color: 'var(--gray-1)' }}>
          {meta}
        </div>
      )}
    </div>
  )
}
