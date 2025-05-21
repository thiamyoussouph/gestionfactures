"use client"
import { getShopsByEmail } from "@/app/actions"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ShopList() {
  const { user } = useUser()
  const [shops, setShops] = useState<any[]>([])

  useEffect(() => {
    const loadShops = async () => {
      if (user?.primaryEmailAddress?.emailAddress) {
        const userShops = await getShopsByEmail(user.primaryEmailAddress.emailAddress)
        setShops(userShops)
      }
    }
    loadShops()
  }, [user])

  return (
    <div className="mt-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.map(shop => (
          <div key={shop.id} className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">{shop.name}</h3>
              <div className="text-sm space-y-2">
                <p><strong>NINEA:</strong> {shop.ninea}</p>
                <p><strong>Adresse:</strong> {shop.address}</p>
                <p><strong>Téléphone:</strong> {shop.phone}</p>
              </div>
              <div className="card-actions justify-end mt-4">
                <Link href={`/shop/${shop.id}`} className="btn btn-sm btn-primary">
                  Voir les détails
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}