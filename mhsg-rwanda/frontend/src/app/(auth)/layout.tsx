/**
 * Auth layout — no sidebar, full-page centred layout for login / register.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
      {children}
    </div>
  );
}
