"use client";

import { deleteInvoice, getInvoiceById, updateInvoice } from "@/app/actions";
import InvoiceInfo from "@/app/components/InvoiceInfo";
import InvoiceLines from "@/app/components/InvoiceLines";
import InvoicePDF from "@/app/components/InvoicePDF";
import VATControl from "@/app/components/VATControl";
import Wrapper from "@/app/components/Wrapper";
import { Invoice, Totals } from "@/type";
import { Save, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// ✅ Type pour les props de page dynamique
type PageProps = {
  params: {
    invoiceId: string;
  };
};

const Page = ({ params }: PageProps) => {
  // ... reste du code identique

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ✅ fetchInvoice déplacé dans useEffect
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { invoiceId } = params;
        const fetchedInvoice = await getInvoiceById(invoiceId);
        if (fetchedInvoice) {
          setInvoice(fetchedInvoice);
          setInitialInvoice(fetchedInvoice);
        }
      } catch (error) {
        console.error("Erreur de chargement :", error);
      }
    };
    fetchInvoice();
  }, [params]);

  // ✅ Calcul des totaux dès que l'invoice change
  useEffect(() => {
    if (!invoice) return;
    const ht = invoice.lines.reduce((acc, { quantity, unitPrice }) => acc + quantity * unitPrice, 0);
    const vat = invoice.vatActive ? ht * (invoice.vatRate / 100) : 0;
    setTotals({ totalHT: ht, totalVAT: vat, totalTTC: ht + vat });
  }, [invoice]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(invoice) === JSON.stringify(initialInvoice));
  }, [invoice, initialInvoice]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = parseInt(e.target.value);
    if (invoice) {
      setInvoice({ ...invoice, status: newStatus });
    }
  };

  const handleSave = async () => {
    if (!invoice) return;
    setIsLoading(true);
    try {
      await updateInvoice(invoice);
      const updated = await getInvoiceById(invoice.id);
      if (updated) {
        setInvoice(updated);
        setInitialInvoice(updated);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = typeof window !== "undefined" && window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?");
    if (confirmed && invoice) {
      try {
        await deleteInvoice(invoice.id);
        router.push("/");
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  if (!invoice || !totals) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Facture Non Trouvée</span>
      </div>
    );
  }

  return (
    <Wrapper>
      <div>
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <p className="badge badge-ghost badge-lg uppercase">
            <span>Facture-</span>{invoice.id}
          </p>
          <div className="flex md:mt-0 mt-4">
            <select
              className="select select-sm select-bordered w-full"
              value={invoice.status}
              onChange={handleStatusChange}
            >
              <option value={1}>Brouillon</option>
              <option value={2}>En attente</option>
              <option value={3}>Payée</option>
              <option value={4}>Annulée</option>
              <option value={5}>Impayée</option>
            </select>

            <button
              className="btn btn-sm btn-accent ml-4"
              disabled={isSaveDisabled || isLoading}
              onClick={handleSave}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Sauvegarder
                  <Save className="w-4 ml-2" />
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="btn btn-sm btn-accent ml-4"
            >
              <Trash className="w-4" />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-col md:flex-row w-full">
          {/* Colonne gauche : infos */}
          <div className="flex w-full md:w-1/3 flex-col">
            <div className="mb-4 bg-base-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="badge badge-accent">Résumé des Totaux</div>
                <VATControl invoice={invoice} setInvoice={setInvoice} />
              </div>

              <div className="flex justify-between">
                <span>Total Hors Taxes</span>
                <span>{totals.totalHT.toFixed(2)} CFA</span>
              </div>

              <div className="flex justify-between">
                <span className="bg-accent">TVA ({invoice.vatActive ? `${invoice.vatRate}` : "0"} %)</span>
                <span>{totals.totalVAT.toFixed(2)} CFA</span>
              </div>

              <div className="flex justify-between font-bold">
                <span>Total TTC</span>
                <span>{totals.totalTTC.toFixed(2)} CFA</span>
              </div>
            </div>

            <InvoiceInfo invoice={invoice} setInvoice={setInvoice} />
          </div>

          {/* Colonne droite : lignes + PDF */}
          <div className="flex w-full md:w-2/3 flex-col md:ml-4">
            <InvoiceLines invoice={invoice} setInvoice={setInvoice} />
            <InvoicePDF invoice={invoice} totals={totals} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Page;
