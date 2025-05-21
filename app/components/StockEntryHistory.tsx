"use client";

import { useEffect, useState } from "react";
import { getStockEntryHistoryByShop } from "@/app/actions";
import { StockMovement } from "@prisma/client";

type EntryWithProductAndShop = StockMovement & {
  product: {
    name: string;
  };
  shop?: {
    name: string;
  };
};

export default function StockEntryHistory({ shopId }: { shopId: string }) {
  const [entries, setEntries] = useState<EntryWithProductAndShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      getStockEntryHistoryByShop(shopId).then((data) => {
        // ✅ Corrige le problème de type avec `shop: null`
        const cleanedData = data.map((entry) => ({
          ...entry,
          shop: entry.shop ?? undefined,
        }));

        setEntries(cleanedData);
        setLoading(false);
      });
    }
  }, [shopId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📋 Historique des entrées de stock</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : entries.length === 0 ? (
        <p>Aucune entrée trouvée.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="border p-3 rounded bg-gray-50">
              <p><strong>Produit :</strong> {entry.product.name}</p>
              <p><strong>Quantité :</strong> {entry.quantity}</p>
              <p><strong>Date :</strong> {new Date(entry.createdAt).toLocaleString()}</p>
              <p><strong>Boutique :</strong> {entry.shop?.name || "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
