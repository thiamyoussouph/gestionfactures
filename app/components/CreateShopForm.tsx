"use client"
import { useState } from "react"
import { createShop } from '@/app/actions'

import { validateShop } from "@/lib/validation" // Importez la validation

export default function CreateShopForm({
  userEmail,
  onSuccess
}: {
  userEmail: string
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    ninea: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}) // Nouvel état pour les erreurs par champ

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Efface l'erreur quand l'utilisateur modifie le champ
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Validation des données
    const { isValid, errors } = validateShop(formData)
    
    if (!isValid) {
      setFieldErrors(errors) // Affiche les erreurs sous chaque champ
      setError("Veuillez corriger les erreurs dans le formulaire")
      return
    }
    
    // 2. Si validation OK, procéder à la création
    setIsLoading(true)
    setError("")
    setFieldErrors({})
    
    try {
      await createShop({
        ...formData,
        userEmail
      })
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Champ Nom */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nom de la boutique*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input input-bordered ${fieldErrors.name ? 'input-error' : ''}`}
            required
          />
          {fieldErrors.name && (
            <span className="text-error text-xs mt-1">{fieldErrors.name}</span>
          )}
        </div>

        {/* Champ NINEA */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Numéro NINEA*</span>
          </label>
          <input
            type="text"
            name="ninea"
            value={formData.ninea}
            onChange={handleChange}
            className={`input input-bordered ${fieldErrors.ninea ? 'input-error' : ''}`}
            required
          />
          {fieldErrors.ninea && (
            <span className="text-error text-xs mt-1">{fieldErrors.ninea}</span>
          )}
        </div>

        {/* Champ Adresse */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Adresse*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`input input-bordered ${fieldErrors.address ? 'input-error' : ''}`}
            required
          />
          {fieldErrors.address && (
            <span className="text-error text-xs mt-1">{fieldErrors.address}</span>
          )}
        </div>

        {/* Champ Téléphone */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Téléphone*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`input input-bordered ${fieldErrors.phone ? 'input-error' : ''}`}
            required
          />
          {fieldErrors.phone && (
            <span className="text-error text-xs mt-1">{fieldErrors.phone}</span>
          )}
        </div>
      </div>

      {/* Message d'erreur général */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner"></span>
            Création en cours...
          </>
        ) : (
          "Enregistrer la boutique"
        )}
      </button>
    </form>
  )
}