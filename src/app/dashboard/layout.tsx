import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { DashboardNavSidebar } from '@/components/dashboard-nav-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--gray-4)' }}>
      <DashboardNavSidebar user={session.user} />
      <main id="main-content" className="flex-1" style={{ marginLeft: 'var(--sidebar-w)', padding: '28px' }}>
        {children}
      </main>
    </div>
  )
}
