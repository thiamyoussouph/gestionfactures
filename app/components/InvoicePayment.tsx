"use client"
import { useState } from "react"
import { Invoice } from "@/type"
import { addInvoicePayment } from "@/app/actions";
 // ✅ adapte le chemin

interface Props {
  invoice: Invoice
  onPaid: (invoice: Invoice) => void // ✅ accepte un argument
}


const InvoicePayment: React.FC<Props> = ({ invoice, onPaid }) => {
  const total = invoice.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)
  const [receivedAmount, setReceivedAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("espèces")

  const changeGiven = receivedAmount > total ? receivedAmount - total : 0
  const paidAmount = receivedAmount > total ? total : receivedAmount

const handlePay = async () => {
  await addInvoicePayment(invoice.id, {
    amount: paidAmount,
    received: receivedAmount,
    change: changeGiven,
    method: paymentMethod,
  });
const res = await fetch(`/api/invoice/${invoice.id}`);
const updatedInvoice = await res.json();
onPaid(updatedInvoice);

  
};


  return (
    <div className="bg-base-200 p-4 rounded-xl space-y-2">
      <div>Total à payer : <strong>{total.toFixed(2)} CFA</strong></div>

      <input
        type="number"
        className="input input-bordered w-full"
        placeholder="Montant reçu"
        value={receivedAmount}
        onChange={(e) => setReceivedAmount(parseFloat(e.target.value))}
      />

      <select
        className="select select-bordered w-full"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="espèces">Espèces</option>
        <option value="wave">Wave</option>
        <option value="orange money">Orange Money</option>
        <option value="paypal">PayPal</option>
        <option value="carte bancaire">Carte Bancaire</option>
      </select>

      <div>Montant rendu : <strong>{changeGiven.toFixed(2)} CFA</strong></div>

      <button
  onClick={handlePay}
  className="btn btn-accent w-full mt-2"
  disabled={invoice.status === 3}
>
  Enregistrer le paiement
</button>
    </div>
  )
}

export default InvoicePayment
