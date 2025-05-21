"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { getProductsByShop, addMultipleStockMovements } from "@/app/actions";

import AppShell from "@/app/components/AppShell";
import { Product } from "@/type";
import StockEntryHistory from "@/app/components/StockEntryHistory";

interface ProductEntry {
  product: Product;
  quantity: number;
}

export default function StockEntryPage() {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<ProductEntry[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const toast = useRef<Toast>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const shop = localStorage.getItem("selectedShop");
    setSelectedShop(shop);
    if (shop) {
      getProductsByShop(shop).then(setProducts);
    }
  }, [refreshKey]);

  const addEntry = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.current?.show({ severity: "warn", summary: "Erreur", detail: "Produit et quantité requis." });
      return;
    }
    setEntries((prev) => [...prev, { product: selectedProduct, quantity }]);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const submitEntries = async () => {
    if (!selectedShop) {
      toast.current?.show({
        severity: "warn",
        summary: "Erreur",
        detail: "Aucune boutique sélectionnée."
      });
      return;
    }

    try {
      await addMultipleStockMovements(
        entries.map(entry => ({
          productId: entry.product.id,
          quantity: entry.quantity,
          shopId: selectedShop,
          type: "ENTRY"
        }))
      );

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Entrée(s) enregistrée(s)."
      });

      setEntries([]);
      setDialogVisible(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec d'enregistrement."
      });
    }
  };

  return (
    <AppShell selectedShop={selectedShop} onShopSelect={setSelectedShop} refreshKey={refreshKey}>
      <Toast ref={toast} />
      <div className="p-4">
        <Button label="Nouvelle entrée de stock" icon="pi pi-plus" onClick={() => setDialogVisible(true)} />
      </div>

      <StockEntryHistory shopId={selectedShop || ""} />

      <Dialog
        header="Entrée de stock"
        visible={dialogVisible}
        modal
        style={{ width: "500px" }}
        onHide={() => setDialogVisible(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Produit</label>
            <Dropdown
              value={selectedProduct}
              options={products}
              onChange={(e) => setSelectedProduct(e.value)}
              optionLabel="name"
              placeholder="Choisir un produit"
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Quantité</label>
            <InputNumber
              value={quantity}
              onValueChange={(e) => setQuantity(e.value || 1)}
              className="w-full"
            />
          </div>
          <Button label="Ajouter au lot" icon="pi pi-plus" className="w-full" onClick={addEntry} />

          {entries.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Produits à enregistrer :</h4>
              <ul className="list-disc pl-5">
                {entries.map((entry, index) => (
                  <li key={index}>{entry.product.name} - {entry.quantity}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            label="Valider l'entrée"
            icon="pi pi-check"
            className="w-full mt-4"
            onClick={submitEntries}
            disabled={entries.length === 0}
          />
        </div>
      </Dialog>
    </AppShell>
  );
}
