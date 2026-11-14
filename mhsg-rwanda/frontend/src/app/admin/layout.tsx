import { SidebarLayout } from "@/components/layout/SidebarLayout"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout role="ADMIN">{children}</SidebarLayout>
}
