"use client"

import { useState } from "react"
import { createCategory } from "@/app/actions"

export default function CategoryFormModal({
  shopId,
  onSuccess
}: {
  shopId: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  const handleCreate = async () => {
    if (!name) return alert("Le nom est requis.")
    await createCategory({ name, shopId });
    setName("")
    setOpen(false)
    onSuccess()
  }

  return (
    <>
      <button className="btn btn-sm btn-outline" onClick={() => setOpen(true)}>
        Créer une catégorie
      </button>

      {open && (
        <dialog open className="modal">
          <div className="modal-box max-w-md">
            <button
              onClick={() => setOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-4">Nouvelle catégorie</h3>
            <input
              type="text"
              placeholder="Nom de la catégorie"
              className="input input-bordered w-full mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleCreate} className="btn btn-accent w-full">
              Créer
            </button>
          </div>
        </dialog>
      )}
    </>
  )
}
