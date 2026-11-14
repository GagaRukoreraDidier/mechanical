'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'
import {
  LayoutDashboard,
  FileText,
  Plus,
  MessageSquare,
  Star,
  User,
  CreditCard,
  Users,
  ListChecks,
  Link2,
  BarChart3,
  Settings,
  ShieldCheck,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Wrench,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'CUSTOMER':
      return [
        { label: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
        { label: 'My Requests', href: '/customer/requests', icon: FileText },
        { label: 'New Request', href: '/customer/requests/new', icon: Plus },
        { label: 'Messages', href: '/customer/messages', icon: MessageSquare },
      ]
    case 'GARAGE':
    case 'MECHANIC':
    case 'SELLER':
    case 'HOME_TECH':
      return [
        { label: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
        { label: 'My Offers', href: '/provider/offers', icon: Star },
        { label: 'My Profile', href: '/provider/profile', icon: User },
        { label: 'Connections', href: '/provider/connections', icon: Link2 },
        { label: 'Subscriptions', href: '/provider/subscriptions', icon: CreditCard },
        { label: 'Messages', href: '/provider/messages', icon: MessageSquare },
      ]
    case 'ADMIN':
      return [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Requests Queue', href: '/admin/requests', icon: ClipboardList },
        { label: 'Providers', href: '/admin/providers', icon: Users },
        { label: 'Matching', href: '/admin/matching', icon: Link2 },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Configuration', href: '/admin/config', icon: Settings },
      ]
    case 'SUPER_ADMIN':
      return [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Requests Queue', href: '/admin/requests', icon: ClipboardList },
        { label: 'Providers', href: '/admin/providers', icon: Users },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Matching', href: '/admin/matching', icon: Link2 },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Configuration', href: '/admin/config', icon: Settings },
        { label: 'Fee Config', href: '/admin/fees', icon: CreditCard },
        { label: 'Audit Log', href: '/admin/audit', icon: ShieldCheck },
      ]
    default:
      return []
  }
}

function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    CUSTOMER: 'Customer',
    SELLER: 'Spare Parts Seller',
    GARAGE: 'Garage',
    MECHANIC: 'Mechanic',
    HOME_TECH: 'Home Technician',
    ADMIN: 'Administrator',
    SUPER_ADMIN: 'Super Admin',
    SUPPORT: 'Support',
  }
  return map[role] ?? role
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface SidebarLayoutProps {
  children: React.ReactNode
  role: UserRole
}

export function SidebarLayout({ children, role }: SidebarLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = (session?.user as any)?.full_name || session?.user?.name || 'User'
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = getNavItems(role)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23A6BD] shrink-0">
          <Wrench className="h-4 w-4 text-[#010313]" />
        </div>
        <div className="min-w-0">
          <span className="block text-[14px] font-bold text-white truncate">MHSG Rwanda</span>
          <span className="block text-[10px] font-semibold text-[#23A6BD] truncate">FIX-IT-FAST CO. Ltd · GAMU</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="mb-2 px-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#55608f]">
            Navigation
          </span>
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 relative',
                    isActive
                      ? 'bg-[#23A6BD]/15 text-white'
                      : 'text-[#b3b8d1] hover:bg-white/5 hover:text-white',
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#23A6BD]" />
                  )}
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#23A6BD]' : '')} />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 text-[#23A6BD]" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#23A6BD]/20 text-[11px] font-bold text-[#23A6BD]">
            {userName ? getInitials(userName) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-white">
              {userName}
            </p>
            <p className="truncate text-[10px] text-[#b3b8d1]">
              {roleLabel(role)}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="shrink-0 rounded-lg p-1.5 text-[#b3b8d1] hover:bg-white/10 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-1 text-center text-[10px] text-[#55608f]">
          Owned by FIX-IT-FAST CO. Ltd &amp; GAMU
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6f8]">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:flex lg:flex-col bg-gradient-to-b from-[#010313] to-[#050819] text-[#b3b8d1]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-[#010313] to-[#050819] text-[#b3b8d1] z-50 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-[#b3b8d1] hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#ececf0] bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f3f4f6]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#23A6BD]">
              <Wrench className="h-3.5 w-3.5 text-[#010313]" />
            </div>
            <span className="text-[13px] font-bold text-[#010313]">MHSG Rwanda</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
