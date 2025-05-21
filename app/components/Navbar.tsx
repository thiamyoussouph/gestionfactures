"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { checkAndAddUser, getShopsByEmail } from "../actions";
import Image from "next/image";

interface NavbarProps {
  onShopSelect: (shopId: string) => void;
  selectedShop: string | null;
  refreshKey: number;
}

// ✅ Ajout d'un type pour les boutiques
interface Shop {
  id: string;
  name: string;
}

const Navbar: React.FC<NavbarProps> = ({ onShopSelect, selectedShop, refreshKey }) => {
  const pathname = usePathname();
  const { user } = useUser();
  const [shops, setShops] = useState<Shop[]>([]); // ✅ plus de `any`

  const navLinks = [
    { href: "/", label: "Factures", match: (path: string) => path === "/" },
    { href: "/shops", label: "Boutiques", match: (path: string) => path.startsWith("/shops") },
    { href: "/products", label: "Produits", match: (path: string) => path.startsWith("/products") },
    { href: "/stock/entry", label: "Entrée de stock", match: (path: string) => path.startsWith("/stock-entry") },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
        await checkAndAddUser(user.primaryEmailAddress.emailAddress, user.fullName);
        const userShops = await getShopsByEmail(user.primaryEmailAddress.emailAddress);
        setShops(userShops);
      }
    };
    loadUserData();
  }, [user, refreshKey]);

  const isActiveLink = (link: typeof navLinks[0]) => link.match(pathname);

  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4 bg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.jpeg"
              alt="Logo Active Solution"
              width={60}
              height={60}
              className="object-contain rounded-full"
            />
          </div>
          <span className="font-bold text-2xl italic">
            ACTIVE<span className="text-accent">SOLUTION</span>
          </span>
        </div>

        <div className="flex space-x-4 items-center">
          <div className="hidden md:flex space-x-2">
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                className={`btn btn-sm ${
                  isActiveLink(link)
                    ? "bg-accent text-accent-content hover:bg-accent-focus"
                    : "btn-ghost"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {shops.length > 0 && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm">
                {selectedShop
                  ? shops.find((s) => s.id === selectedShop)?.name || "Boutique"
                  : `Boutiques (${shops.length})`}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                {shops.map((shop) => (
                  <li key={shop.id}>
                    <button
                      onClick={() => onShopSelect(shop.id)}
                      className={`text-left p-2 w-full text-start ${
                        selectedShop === shop.id ? "bg-base-200 font-medium" : ""
                      }`}
                    >
                      {shop.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <div className="md:hidden mt-2 flex justify-center space-x-2">
        {navLinks.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            className={`btn btn-sm ${
              isActiveLink(link)
                ? "bg-accent text-accent-content hover:bg-accent-focus"
                : "btn-ghost"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
