'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BookOpen,
  FileText,
  Settings,
  Award,
  FolderKanban,
  BarChart3,
  ClipboardList,
  Cpu
} from 'lucide-react'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'general' },
  { name: 'Students', href: '/dashboard/students', icon: Users, section: 'general' },
  { name: 'Foundation', href: '/dashboard/curriculum', icon: BookOpen, section: 'general' },
  { name: 'Teams', href: '/dashboard/teams', icon: Cpu, section: 'general' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, section: 'general', badge: 5 },
  { name: 'Skills', href: '/dashboard/skills', icon: Award, section: 'operations' },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, section: 'operations' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, section: 'operations' },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, section: 'operations' },
]

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function DashboardNavSidebar({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const initials = getInitials(user.name || user.email || 'User')

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 flex flex-col z-50"
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--black)',
      }}
    >
      {/* Logo */}
      <div
        className="px-[18px] py-5 border-b"
        style={{ borderColor: 'var(--black-2)' }}
      >
        <div className="text-white font-bold text-lg tracking-tight">
          Caution Tape Robotics
        </div>
        <div
          className="text-xs uppercase tracking-wider mt-1.5"
          style={{ color: 'var(--gray-2)', letterSpacing: '0.08em' }}
        >
          Club Manager
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {/* General Section */}
        <div
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-2.5 mb-1"
          style={{ color: 'var(--gray-1)', letterSpacing: '0.1em' }}
        >
          General
        </div>
        {navigation.filter(item => item.section === 'general').map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-all',
                isActive
                  ? 'font-bold'
                  : 'hover:bg-[var(--black-2)]'
              )}
              style={{
                background: isActive ? 'var(--yellow)' : 'transparent',
                color: isActive ? 'var(--black)' : 'var(--gray-2)',
              }}
            >
              <Icon size={16} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? 'var(--black)' : 'var(--yellow)',
                    color: isActive ? 'var(--yellow)' : 'var(--black)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        {/* Operations Section */}
        <div
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-2.5 mb-1 mt-2"
          style={{ color: 'var(--gray-1)', letterSpacing: '0.1em' }}
        >
          Operations
        </div>
        {navigation.filter(item => item.section === 'operations').map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-all',
                isActive
                  ? 'font-bold'
                  : 'hover:bg-[var(--black-2)]'
              )}
              style={{
                background: isActive ? 'var(--yellow)' : 'transparent',
                color: isActive ? 'var(--black)' : 'var(--gray-2)',
              }}
            >
              <Icon size={16} />
              <span className="flex-1">{item.name}</span>
            </Link>
          )
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-all',
            pathname === '/dashboard/settings'
              ? 'font-bold'
              : 'hover:bg-[var(--black-2)]'
          )}
          style={{
            background: pathname === '/dashboard/settings' ? 'var(--yellow)' : 'transparent',
            color: pathname === '/dashboard/settings' ? 'var(--black)' : 'var(--gray-2)',
          }}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Profile */}
      <div
        className="px-3.5 py-3.5 border-t"
        style={{ borderColor: 'var(--black-3)' }}
      >
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: 'var(--yellow)',
              color: 'var(--black)',
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">
              {user.name || 'Coach'}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--gray-2)' }}>
              Lead Mentor
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-[11px] opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--gray-2)' }}
            title="Sign out"
          >
            ↗
          </button>
        </div>
      </div>
    </aside>
  )
}
