"use client"

import { useEffect, useState } from "react"
import { createShop, getShopById, updateShop } from "@/app/actions"

export default function ShopModalForm({
  userEmail,
  mode = "create",
  shopId,
  onSuccess,
  onClose
}: {
  userEmail: string
  mode?: "create" | "edit"
  shopId?: string
  onSuccess?: () => void
  onClose?: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    ninea: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (mode === "edit" && shopId) {
      getShopById(shopId).then(shop => {
        if (shop) {
          setFormData({
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            ninea: shop.ninea
          })
        }
      })
    }
  }, [mode, shopId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
  if (mode === "create") {
    await createShop({ ...formData, userEmail });
  } else if (mode === "edit" && shopId) {
    await updateShop(shopId, formData);
  }
  onSuccess?.();
  onClose?.();
} catch (err) {
  console.error("Erreur lors de la soumission :", err); // ✅ log utile
  setError("Erreur lors de l'enregistrement.");
} finally {
  setIsLoading(false);
}

  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold">
        {mode === "create" ? "Créer une boutique" : "Modifier la boutique"}
      </h2>

      {["name", "address", "phone", "ninea"].map(field => (
        <input
          key={field}
          name={field}
          value={formData[field as keyof typeof formData]}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder={field}
          required
        />
      ))}

      {error && <p className="text-error">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? "Enregistrement..." : "Valider"}
      </button>
    </form>
  )
}
