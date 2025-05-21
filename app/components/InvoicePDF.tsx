'use client'

import { Invoice, Totals } from '@/type'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ArrowDownFromLine } from 'lucide-react'
import React, { useRef } from 'react'
import { numberToFrenchWords } from '@/lib/numberToWords'
import dayjs from 'dayjs'

interface FacturePDFProps {
  invoice: Invoice
  totals: Totals
}

const InvoicePDF: React.FC<FacturePDFProps> = ({ invoice, totals }) => {
  const factureRef = useRef<HTMLDivElement>(null)

  const handleDownloadPdf = async () => {
    const element = factureRef.current
    if (element) {
      try {
        const canvas = await html2canvas(element, { scale: 3, useCORS: true })
        const imgData = canvas.toDataURL('image/png')

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'A4',
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`facture-${invoice.name}.pdf`)

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999,
        })
      } catch (error) {
        console.error('Erreur lors de la génération du PDF :', error)
      }
    }
  }

  return (
    <div className='mt-4 hidden lg:block'>
      <div className='border-base-300 border-2 border-dashed rounded-xl p-5'>
        <button
          onClick={handleDownloadPdf}
          className='btn btn-sm btn-accent mb4'
        >
          Facture PDF
          <ArrowDownFromLine className='w-4' />
        </button>

        <div className='p-8' ref={factureRef}>
          <div className='flex justify-between items-center text-sm'>
            <div className='flex flex-col'>
              <h1 className='text-7xl font-bold uppercase text-primary'>
                Facture
              </h1>
            </div>
            <div className='text-right uppercase'>
              <p className='badge badge-ghost '>Facture ° {invoice.id}</p>
              <p className='my-2'>
                <strong>Date :</strong>{' '}
                {dayjs(invoice.invoiceDate).format('DD MMM YYYY')}
              </p>
              <p>
                <strong>Échéance :</strong>{' '}
                {dayjs(invoice.dueDate).format('DD MMM YYYY')}
              </p>
            </div>
          </div>

          <div className='my-6 flex justify-between'>
            <div>
              <p className='badge badge-ghost mb-2'>Émetteur</p>
              <p className='text-sm font-bold italic'>{invoice.issuerName}</p>
              <p className='text-sm text-gray-500 w-52 break-words'>
                {invoice.issuerAddress}
              </p>

              {/* ✅ Ajout téléphone et NINEA si shop lié */}
              {invoice.shop && (
                <>
                  <p className='text-sm text-gray-500 mt-1'>
                    Téléphone : {invoice.shop.phone}
                  </p>
                  <p className='text-sm text-gray-500'>
                    NINEA : {invoice.shop.ninea}
                  </p>
                </>
              )}
            </div>

            <div className='text-right'>
              <p className='badge badge-ghost mb-2'>Client</p>
              <p className='text-sm font-bold italic'>{invoice.clientName}</p>
              <p className='text-sm text-gray-500 w-52 break-words'>
                {invoice.clientAddress}
              </p>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='table table-zebra'>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix Unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((ligne, index) => (
                  <tr key={index + 1}>
                    <td>{index + 1}</td>
                    <td>{ligne.description}</td>
                    <td>{ligne.quantity}</td>
                    <td>{ligne.unitPrice.toFixed(2)}</td>
                    <td>{(ligne.quantity * ligne.unitPrice).toFixed(2)} CFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-6 space-y-2 text-md'>
            <div className='flex justify-between'>
              <div className='font-bold'>Total Hors Taxes</div>
              <div>{totals.totalHT.toFixed(2)} CFA</div>
            </div>

            {invoice.vatActive && (
              <div className='flex justify-between'>
                <div className='font-bold'>TVA {invoice.vatRate} %</div>
                <div>{totals.totalVAT.toFixed(2)} CFA</div>
              </div>
            )}

            <div className='flex justify-between'>
              <div className='font-bold'>Total TTC</div>
              <div className='badge badge-accent'>
                {totals.totalTTC.toFixed(2)} CFA
              </div>
            </div>

            <div className='mt-5 space-y-2 text-right'>
  <p className='italic text-sm text-secondary'>
    Montant total arrêté à la somme de : {numberToFrenchWords(totals.totalTTC)}.
  </p>

  <p className='text-sm'>
    <strong>Montant reçu :</strong> {invoice.receivedAmount?.toFixed(2) ?? '0'} CFA
  </p>
  <p className='text-sm'>
    <strong>Montant rendu :</strong> {invoice.changeGiven?.toFixed(2) ?? '0'} CFA
  </p>
  <p className='text-sm'>
    <strong>Moyen de paiement :</strong> {invoice.paymentMethod ?? 'Non spécifié'}
  </p>
</div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoicePDF
