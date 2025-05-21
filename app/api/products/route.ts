import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        barcode: true,
        price: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Erreur chargement produits :", error)
    return new NextResponse("Erreur", { status: 500 })
  }
}
