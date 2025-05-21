"use client"

import { Invoice } from '@/type'
import { InvoiceLine } from '@prisma/client'
import { Plus, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { AutoComplete } from 'primereact/autocomplete'
import { Product } from '@prisma/client' // ou ton type custom si besoin
import InvoicePayment from './InvoicePayment'

interface Props {
  invoice: Invoice
  setInvoice: (invoice: Invoice) => void
}


const InvoiceLines: React.FC<Props> = ({ invoice, setInvoice }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [barcodeInput, setBarcodeInput] = useState<string>('')


  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
  }, [])
const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handleAddLine = () => {
    const newLine: InvoiceLine & { productId?: string } = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      invoiceId: invoice.id,
      productId: '',
      createdAt: new Date(),
     updatedAt: new Date()
    }
    setInvoice({ ...invoice, lines: [...invoice.lines, newLine] })
  }

  const handleRemoveLine = (index: number) => {
    const updatedLines = invoice.lines.filter((_, i) => i !== index)
    setInvoice({ ...invoice, lines: updatedLines })
  }

  

  const handleQuantityChange = (index: number, value: string) => {
    const updatedLines = [...invoice.lines]
    updatedLines[index].quantity = value === '' ? 0 : parseInt(value)
    setInvoice({ ...invoice, lines: updatedLines })
  }

  const handleUnitPriceChange = (index: number, value: string) => {
    const updatedLines = [...invoice.lines]
    updatedLines[index].unitPrice = value === '' ? 0 : parseFloat(value)
    setInvoice({ ...invoice, lines: updatedLines })
  }

  const searchProducts = (event: { query: string }) => {
    setFilteredProducts(
      allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(event.query.toLowerCase()) ||
          (product.barcode || '').includes(event.query)
      )
    )
  }

  const handleBarcodeSearch = () => {
  const found = allProducts.find((p) => p.barcode === barcodeInput.trim());

  if (!found) {
    alert("Produit non trouvé");
    return;
  }

  const existingIndex = invoice.lines.findIndex((line) => line.productId === found.id);

  const updatedLines = [...invoice.lines];

  if (existingIndex !== -1) {
    // Produit déjà présent → on augmente la quantité
    updatedLines[existingIndex].quantity += 1;
  } else {
    // Produit pas encore présent → on l'ajoute
    const now = new Date();
    const newLine: InvoiceLine & { productId: string } = {
      id: crypto.randomUUID(),
      description: found.name,
      quantity: 1,
      unitPrice: found.price,
      invoiceId: invoice.id,
      productId: found.id,
      createdAt: now,
       updatedAt: now,
    };
    updatedLines.push(newLine);
  }

  setInvoice({ ...invoice, lines: updatedLines });
  setBarcodeInput('');
}



  return (
    <div className="h-fit bg-base-200 p-5 rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="badge badge-accent">Produits / Services</h2>
        <div className="flex gap-2">
          <input
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
            placeholder="Scan ou code-barre"
            className="input input-sm input-bordered"
          />
          <button className="btn btn-sm btn-accent" onClick={handleBarcodeSearch}>
            OK
          </button>
          <button className="btn btn-sm btn-accent" onClick={handleAddLine}>
            <Plus className="w-4" />
          </button>
        </div>
      </div>

      <div className="scrollable">
        <table className="table w-full">
          <thead className="uppercase">
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix Unitaire (HT)</th>
              <th>Montant (HT)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, index) => (
              <tr key={line.id}>
                <td>
                 <AutoComplete
  value={line.description}
  suggestions={filteredProducts}
  completeMethod={searchProducts}
  field="name"
  placeholder="Rechercher produit"
  className="w-full"
  onChange={(e) => {
    const value = e.value;
    const updatedLines = [...invoice.lines];

    updatedLines[index].description =
      typeof value === 'string' ? value : value.name;

    setInvoice({ ...invoice, lines: updatedLines });
  }}
 onSelect={(e) => {
  const selected = e.value as Product;
  const updatedLines = [...invoice.lines];

  const existingIndex = updatedLines.findIndex(
    (line) => line.productId === selected.id
  );

  if (existingIndex !== -1) {
    // Le produit est déjà dans la facture → on augmente juste la quantité
    updatedLines[existingIndex].quantity += 1;
  } else {
    // Nouveau produit → on remplit la ligne actuelle
    updatedLines[index] = {
      ...updatedLines[index],
      description: selected.name,
      unitPrice: selected.price,
      productId: selected.id,
      quantity: 1, // on réinitialise pour éviter des erreurs de saisie
    };
  }

  setInvoice({ ...invoice, lines: updatedLines });
}}

/>

                </td>
                <td>
                  <input
                    type="number"
                    value={line.quantity}
                    className="input input-sm input-bordered w-full"
                    min={0}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={line.unitPrice}
                    className="input input-sm input-bordered w-full"
                    min={0}
                    step={0.01}
                    onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                  />
                </td>
                <td className="font-bold">
                  {(line.quantity * line.unitPrice).toFixed(2)} CFA
                </td>
                <td>
                  <button
                    onClick={() => handleRemoveLine(index)}
                    className="btn btn-sm btn-circle btn-accent"
                  >
                    <Trash className="w-4" />
                  </button>
                  
                </td>
              </tr>
            ))}
            
          </tbody>
        </table>
        <div className="mt-4 text-right">
  <button
    onClick={() => setShowPaymentDialog(true)}
    className="btn btn-primary"
  >
    💳 Payer
  </button>
</div>
{showPaymentDialog && (
  <dialog open className="modal">
    <div className="modal-box max-w-md">
      <button
        onClick={() => setShowPaymentDialog(false)}
        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
      >
        ✕
      </button>

      <InvoicePayment
  invoice={invoice}
  onPaid={(updatedInvoice) => {
    setInvoice(updatedInvoice); // ✅ mise à jour directe de la facture
    setShowPaymentDialog(false);
  }}
/>

    </div>
  </dialog>
)}

      </div>
    </div>
  )
}

export default InvoiceLines
