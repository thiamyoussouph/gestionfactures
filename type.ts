import { Invoice as PrismaInvoice, Shop as PrismaShop, InvoiceLine } from "@prisma/client";
import { Product as PrismaProduct, Category as PrismaCategory, StockMovement as PrismaStockMovement } from "@prisma/client"

export interface Shop extends PrismaShop {
  id: string;
  name: string;
  address: string;
  phone: string;
  ninea: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice extends PrismaInvoice {
  id: string;
  name: string;
  issuerName: string;
  issuerAddress: string;
  clientName: string;
  clientAddress: string;
  invoiceDate: string;
  dueDate: string;
  vatActive: boolean;
  vatRate: number;
  status: number;
  lines: InvoiceLine[];
  shop?: Shop;
  userId: string;
  shopId: string;
}

export interface Totals {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
}


export interface Category extends PrismaCategory {
  id: string
  name: string
  shopId: string
}

export interface Product extends PrismaProduct {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string | null      // ✅ pas de `?`
  barcode: string | null       // ✅ pas de `?`
  categoryId: string
  shopId: string
  createdAt: Date
  updatedAt: Date
  category?: Category
}



export interface StockMovement extends PrismaStockMovement {
  id: string
  type: "ENTRY" | "EXIT" | "ADJUSTMENT"
  quantity: number
  productId: string
  createdAt: Date
}

export type BasicShop = Pick<Shop, 'id' | 'name' | 'address' | 'phone' | 'ninea' | 'ownerId' | 'createdAt' | 'updatedAt'>;