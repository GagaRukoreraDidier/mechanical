import { SidebarLayout } from "@/components/layout/SidebarLayout"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout role="CUSTOMER">{children}</SidebarLayout>
}
