export const validateShop = (data: {
  name: string
  address: string
  phone: string
  ninea: string
}) => {
  const errors: Record<string, string> = {}

  if (!data.name) errors.name = "Le nom est requis"
  if (!data.ninea) errors.ninea = "Le NINEA est requis"
  if (!data.address) errors.address = "L'adresse est requise"
  if (!data.phone) errors.phone = "Le téléphone est requis"
  else if (!/^[0-9]{10}$/.test(data.phone)) {
    errors.phone = "Numéro invalide (10 chiffres)"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}