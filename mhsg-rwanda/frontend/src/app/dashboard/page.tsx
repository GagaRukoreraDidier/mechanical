"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardDispatcher() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const role = ((session.user as { role?: string }).role || "CUSTOMER").toUpperCase();

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      router.replace("/admin/dashboard");
    } else if (
      role === "GARAGE" ||
      role === "MECHANIC" ||
      role === "SELLER" ||
      role === "HOME_TECH"
    ) {
      router.replace("/provider/dashboard");
    } else {
      router.replace("/customer/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#23A6BD] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-gray-500 font-medium">Loading your dashboard…</p>
      </div>
    </div>
  );
}
