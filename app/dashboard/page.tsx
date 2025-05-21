"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  getDashboardStats,
  getSalesLast7Days,
  getLowStockProducts,
  getMonthlySales,
} from "@/app/actions";
import AppShell from "@/app/components/AppShell";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  const [stats, setStats] = useState<{
    boutiquesCount: number;
    totalProducts: number;
    stockValue: number;
    totalSalesToday: number;
    unpaidInvoicesToday: number;
  } | null>(null);

  const [salesData, setSalesData] = useState<{ date: string; total: number }[]>([]);
  const [monthlySales, setMonthlySales] = useState<{ month: string; total: number }[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<{ name: string; quantity: number }[]>([]);

  // Charger la boutique sélectionnée depuis localStorage
  useEffect(() => {
    const shopId = localStorage.getItem("selectedShop");
    if (shopId) setSelectedShop(shopId);
  }, []);

  // Charger les données du dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedShop) return;
      setLoading(true);
      try {
        const [statsData, sales, lowStock, monthly] = await Promise.all([
          getDashboardStats(selectedShop),
          getSalesLast7Days(selectedShop),
          getLowStockProducts(selectedShop),
          getMonthlySales(selectedShop),
        ]);
        setStats(statsData);
        setSalesData(sales);
        setLowStockProducts(lowStock);
        setMonthlySales(monthly);

        const now = new Date();
        setLastUpdated(now.toLocaleString("fr-FR"));

        toast.current?.show({
          severity: "success",
          summary: "Données mises à jour",
          detail: "Statistiques rafraîchies avec succès.",
          life: 3000,
        });
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Impossible de charger les statistiques.",
          life: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedShop, refreshKey]);

  return (
    <AppShell selectedShop={selectedShop} onShopSelect={setSelectedShop} refreshKey={refreshKey}>
      <Toast ref={toast} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-semibold">Tableau de bord</h1>
          <Button
            label="Rafraîchir les statistiques"
            icon="pi pi-refresh"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="p-button-sm"
          />
        </div>

        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-4">
            Dernière mise à jour : {lastUpdated}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <ProgressSpinner />
          </div>
        ) : !stats ? (
          <p className="text-center text-gray-500">Aucune donnée trouvée.</p>
        ) : (
          <>
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card title="Boutiques">
                <p className="text-2xl font-bold">{stats.boutiquesCount}</p>
              </Card>

              <Card title="Produits">
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </Card>

              <Card title="Valeur du stock">
                <p className="text-2xl font-bold">{stats.stockValue.toFixed(2)} FCFA</p>
              </Card>

              <Card title="Ventes du jour">
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalSalesToday.toFixed(2)} FCFA
                </p>
              </Card>

              <Card title="Factures impayées (aujourd'hui)">
                <p className="text-2xl font-bold text-red-600">
                  {stats.unpaidInvoicesToday}
                </p>
              </Card>
            </div>

            {/* 🔔 Produits à stock bas */}
            {lowStockProducts.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <h3 className="text-yellow-800 font-semibold mb-2">
                  🔔 Produits avec stock bas
                </h3>
                <ul className="list-disc list-inside text-yellow-700 text-sm">
                  {lowStockProducts.map((p, i) => (
                    <li key={i}>
                      {p.name} — {p.quantity} unité{p.quantity > 1 ? "s" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 📊 Ventes 7 derniers jours */}
            <div className="mt-6 p-4 bg-white rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">Ventes des 7 derniers jours</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#C2942D" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 📈 Ventes par mois */}
            <div className="mt-6 p-4 bg-white rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">Ventes cumulées par mois</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1A1A1A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
