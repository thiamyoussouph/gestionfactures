import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // Récupère l'ID

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      lines: true,
      shop: true,
      payments: true, // ✅ important
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}
