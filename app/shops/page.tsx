"use client"

import AppShell from '@/app/components/AppShell'
import MyShopList from '@/app/components/MyShopList'
import { useState } from 'react'

export default function ShopPage() {
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
 const [refreshKey] = useState(0);


  return (
    <AppShell
      selectedShop={selectedShop}
      onShopSelect={setSelectedShop}
      refreshKey={refreshKey}
    >
      <MyShopList />
    </AppShell>
  )
}
