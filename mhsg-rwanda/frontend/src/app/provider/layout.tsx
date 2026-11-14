import { SidebarLayout } from "@/components/layout/SidebarLayout"

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout role="GARAGE">{children}</SidebarLayout>
}
