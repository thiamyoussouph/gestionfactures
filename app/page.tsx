"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Layers, Plus } from "lucide-react";
import confetti from "canvas-confetti";

import AppShell from "./components/AppShell";
import InvoiceComponent from "./components/InvoiceComponent";
import CreateShopForm from "./components/CreateShopForm";

import {
  createEmptyInvoice,
  getInvoicesByEmail,
  getInvoicesByShop,
  checkIfUserHasShop,
} from "./actions";

import { Invoice } from "@/type";

export default function Home() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceName, setInvoiceName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [hasShop, setHasShop] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkShop = async () => {
      if (email) {
        const result = await checkIfUserHasShop(email);
        setHasShop(result);
      }
    };
    checkShop();
  }, [email]);

  useEffect(() => {
    const savedShop = localStorage.getItem("selectedShop");
    if (savedShop) setSelectedShop(savedShop);
  }, []);

  useEffect(() => {
    if (selectedShop) {
      localStorage.setItem("selectedShop", selectedShop);
    } else {
      localStorage.removeItem("selectedShop");
    }
  }, [selectedShop]);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = selectedShop
        ? await getInvoicesByShop(selectedShop)
        : await getInvoicesByEmail(email);

      if (data) setInvoices(data);
    } catch (error) {
      console.error("Erreur lors du chargement des factures", error);
    } finally {
      setIsLoading(false);
    }
  }, [email, selectedShop]);

  useEffect(() => {
    if (email) fetchInvoices();
  }, [email, selectedShop, fetchInvoices]);

  useEffect(() => {
    setIsNameValid(invoiceName.length <= 60);
  }, [invoiceName]);

  const handleCreateInvoice = async () => {
    try {
      if (!email) return;
      setIsLoading(true);
      await createEmptyInvoice(email, invoiceName, selectedShop || undefined);
      await fetchInvoices();
      setInvoiceName("");
      const modal = document.getElementById("create-invoice-modal") as HTMLDialogElement;
      if (modal) modal.close();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
    } catch (error) {
      console.error("Erreur lors de la création de la facture :", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell selectedShop={selectedShop} onShopSelect={setSelectedShop} refreshKey={refreshKey}>
      <div className="flex flex-col space-y-6 p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {selectedShop
                ? `Factures de ${invoices[0]?.shop?.name || "la boutique"}`
                : "Mes factures"}
            </h1>
            <p className="text-sm text-gray-500">
              {selectedShop
                ? "Gérez les factures de votre boutique"
                : "Toutes vos factures personnelles"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedShop && (
              <button onClick={() => setSelectedShop(null)} className="btn btn-outline btn-sm">
                Voir toutes mes factures
              </button>
            )}
            <button onClick={() => setShowShopForm(true)} className="btn btn-primary btn-sm gap-1">
              <Plus size={16} />
              {hasShop ? "Nouvelle boutique" : "Créer une boutique"}
            </button>
          </div>
        </div>

        {/* Invoices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Create Invoice Card */}
          <div
            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-primary/20 hover:border-primary/40"
            onClick={() => (document.getElementById("create-invoice-modal") as HTMLDialogElement).showModal()}
          >
            <div className="card-body flex flex-col items-center justify-center p-6">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h2 className="card-title text-lg font-semibold text-center">Nouvelle facture</h2>
              <p className="text-sm text-center text-gray-500">Cliquez pour créer</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="col-span-full flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}

          {/* Invoices List */}
          {!isLoading &&
            invoices.map((invoice) => (
              <InvoiceComponent key={invoice.id} invoice={invoice} />
            ))}
        </div>

        {/* Create Invoice Modal */}
        <dialog id="create-invoice-modal" className="modal">
          <div className="modal-box max-w-md">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>
            </form>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Nouvelle Facture</h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom de la facture</span>
                  <span className="label-text-alt">{invoiceName.length}/60</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Facture client X"
                  className={`input input-bordered w-full ${!isNameValid ? "input-error" : ""}`}
                  value={invoiceName}
                  onChange={(e) => setInvoiceName(e.target.value)}
                  maxLength={60}
                />
                {!isNameValid && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      Le nom ne peut pas dépasser 60 caractères
                    </span>
                  </label>
                )}
              </div>
              <button
                className="btn btn-primary w-full mt-4"
                disabled={!isNameValid || invoiceName.length === 0 || isLoading}
                onClick={handleCreateInvoice}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Créer la facture"
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* Create Shop Modal */}
        <dialog open={showShopForm} className="modal">
          <div className="modal-box max-w-2xl relative">
            <button
              onClick={() => setShowShopForm(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            >
              ✕
            </button>
            <div className="p-4">
              <h3 className="text-xl font-bold mb-4">
                {hasShop ? "Ajouter une nouvelle boutique" : "Créer votre première boutique"}
              </h3>
              <CreateShopForm
                userEmail={email}
                onSuccess={() => {
                  setShowShopForm(false);
                  setHasShop(true);
                  fetchInvoices();
                  setRefreshKey((prev) => prev + 1);
                }}
              />
            </div>
          </div>
          {showShopForm && (
            <div className="modal-backdrop bg-black/50" onClick={() => setShowShopForm(false)} />
          )}
        </dialog>
      </div>
    </AppShell>
  );
}
