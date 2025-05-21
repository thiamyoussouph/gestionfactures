"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { getShopsByEmail } from "@/app/actions"
import Navbar from "./Navbar"

interface AppShellProps {
  children: React.ReactNode
  selectedShop: string | null
  onShopSelect: (shopId: string) => void
  refreshKey: number
}

export default function AppShell({ 
  children, 
  selectedShop, 
  onShopSelect, 
  refreshKey 
}: AppShellProps) {
  const { user } = useUser()

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      getShopsByEmail(user.primaryEmailAddress.emailAddress).then(() => {})
    }
  }, [user, refreshKey])

  return (
    <>
      <Navbar
        selectedShop={selectedShop}
        onShopSelect={onShopSelect}
        refreshKey={refreshKey}
      />
      <main className="px-5 md:px-[10%] mt-8 mb-10">{children}</main>
    </>
  )
}
