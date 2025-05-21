"use client"

import { useEffect, useState } from "react"
import { getShopsByEmail, deleteShopById } from "@/app/actions"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Building2, Edit, Trash2, Plus } from "lucide-react"
import ShopModalForm from '@/app/components/ShopModalForm'


export default function MyShopList() {
  const { user } = useUser()
  const [shops, setShops] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const fetchShops = async () => {
      if (user?.primaryEmailAddress?.emailAddress) {
        setIsLoading(true)
        try {
          const userShops = await getShopsByEmail(user.primaryEmailAddress.emailAddress)
          setShops(userShops)
        } catch (error) {
          console.error("Erreur lors du chargement des boutiques", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchShops()
  }, [user])

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette boutique ?")) {
      try {
        await deleteShopById(id)
        setShops(prev => prev.filter(shop => shop.id !== id))
      } catch (error) {
        console.error("Erreur lors de la suppression de la boutique", error)
      }
    }
  }

  const email = user?.primaryEmailAddress?.emailAddress || ""

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Mes boutiques
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle boutique
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="max-w-md mx-auto">
                <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Aucune boutique enregistrée</h3>
                <p className="text-gray-500 mt-2 mb-6">
                  Commencez par créer votre première boutique pour gérer vos factures
                </p>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                  Créer une boutique
                </button>
              </div>
            </div>
          ) : (
            shops.map(shop => (
              <div 
                key={shop.id} 
                className="card bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{shop.name}</h3>
                    <span className="badge badge-accent badge-sm">
                      {shop.ninea}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>{shop.address || "Non renseignée"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>{shop.phone || "Non renseigné"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
                  <button 
                    className="btn btn-sm btn-ghost text-gray-600 hover:text-primary"
                    onClick={() => setEditingShopId(shop.id)}
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost text-gray-600 hover:text-error"
                    onClick={() => handleDelete(shop.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal création */}
      <dialog open={showCreateModal} className="modal">
        <div className="modal-box max-w-2xl">
          <button 
            onClick={() => setShowCreateModal(false)} 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >✕</button>
          <ShopModalForm
            userEmail={email}
            mode="create"
            onSuccess={() => {
              setShowCreateModal(false)
              window.location.reload()
            }}
            onClose={() => setShowCreateModal(false)}
          />
        </div>
      </dialog>

      {/* Modal édition */}
      <dialog open={!!editingShopId} className="modal">
        <div className="modal-box max-w-2xl">
          <button 
            onClick={() => setEditingShopId(null)} 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >✕</button>
          {editingShopId && (
            <ShopModalForm
              userEmail={email}
              mode="edit"
              shopId={editingShopId}
              onSuccess={() => {
                setEditingShopId(null)
                window.location.reload()
              }}
              onClose={() => setEditingShopId(null)}
            />
          )}
        </div>
      </dialog>
    </div>
  )
}
