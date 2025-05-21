// lib/numberToWords.ts
import n2words from 'n2words'

export function numberToFrenchWords(n: number): string {
  const montant = Math.floor(n)
  const decimal = Math.round((n - montant) * 100)

  const enLettre = n2words(montant, { lang: 'fr' })
  const centimes = decimal > 0 ? ` et ${n2words(decimal, { lang: 'fr' })} centimes` : ''

  return `${enLettre} franc${montant > 1 ? 's' : ''}${centimes} CFA`
}
