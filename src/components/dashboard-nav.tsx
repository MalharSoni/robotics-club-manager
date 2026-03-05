'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { cn, getInitials } from '@/lib/utils'
import { Home, Users, CheckSquare, BookOpen, FileText, Settings, LogOut, Menu, X, Award, FolderKanban, BarChart3, ClipboardList } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Stats', href: '/dashboard/stats', icon: ClipboardList },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Skills', href: '/dashboard/skills', icon: Award },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Curriculum', href: '/dashboard/curriculum', icon: BookOpen },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      <nav className="bg-white border-b border-gray-200" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">
                  Robotics Club Manager
                </h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold"
                  aria-label={`User avatar for ${user.name || user.email}`}
                  role="img"
                >
                  {getInitials(user.name || user.email || 'U')}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
                aria-label="Sign out of your account"
                className="hidden sm:flex"
              >
                <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                Sign Out
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                className="sm:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold"
                  aria-label={`User avatar for ${user.name || user.email}`}
                  role="img"
                >
                  {getInitials(user.name || user.email || 'U')}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  aria-label="Sign out of your account"
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
