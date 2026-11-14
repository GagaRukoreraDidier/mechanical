"use client"

import React from "react"
import { SessionProvider } from "next-auth/react"
import { SWRConfig } from "swr"
import api from "@/lib/api"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher: (url: string) => api.get(url).then((res) => res.data),
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  )
}
