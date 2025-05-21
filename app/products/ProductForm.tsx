"use client"

import { useState, useEffect } from "react"
import { createProduct, updateProduct, getCategoriesByShop } from "@/app/actions"
import { Category } from "@/type"

export default function ProductForm({
  shopId,
  product,
  onSuccess
}: {
  shopId: string
  product?: any
  onSuccess: () => void
}) {
  const [name, setName] = useState(product?.name || "")
  const [price, setPrice] = useState(product?.price || 0)
  const [quantity, setQuantity] = useState(product?.quantity || 0) // 👈 ajouté
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "")
  const [barcode, setBarcode] = useState(product?.barcode || "")
  const [categoryId, setCategoryId] = useState(product?.categoryId || "")
  const [categories, setCategories] = useState<Category[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (shopId) {
      getCategoriesByShop(shopId).then(setCategories)
    }
  }, [shopId])

  const handleSubmit = async () => {
    if (!categoryId) return alert("Veuillez choisir une catégorie")

    if (product) {
      await updateProduct(product.id, {
        name,
        price,
        imageUrl,
        barcode,
        categoryId
      })
    } else {
      await createProduct({
        name,
        price,
        quantity, // 👈 obligatoire
        imageUrl,
        barcode,
        categoryId,
        shopId
      })
    }

    onSuccess()
    setOpen(false)
  }

  return (
    <>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => setOpen(true)}
      >
        {product ? "Modifier" : "Ajouter"}
      </button>

      {open && (
        <dialog open className="modal">
          <div className="modal-box">
            <button
              onClick={() => setOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >✕</button>

            <h3 className="font-bold text-lg mb-4">
              {product ? "Modifier le produit" : "Nouveau produit"}
            </h3>

            <input
              type="text"
              placeholder="Nom"
              className="input input-bordered w-full mb-2"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Prix"
              className="input input-bordered w-full mb-2"
              value={price}
              onChange={e => setPrice(parseFloat(e.target.value))}
            />

            <input
              type="number"
              placeholder="Quantité"
              className="input input-bordered w-full mb-2"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value))}
            />

            <input
              type="text"
              placeholder="Code barre (facultatif)"
              className="input input-bordered w-full mb-2"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
            />

            <input
              type="text"
              placeholder="URL image (facultatif)"
              className="input input-bordered w-full mb-2"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />

            <select
              className="select select-bordered w-full mb-4"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Choisir une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <button onClick={handleSubmit} className="btn btn-accent w-full">
              {product ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </dialog>
      )}
    </>
  )
}
