"use server"
import { MovementType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { Invoice } from "@/type";
import { randomBytes } from "crypto";
import { StockMovement } from "@prisma/client";



export async function checkAndAddUser(email: string, name: string) {
    if (!email) return;
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!existingUser && name) {
            await prisma.user.create({
                data: {
                    email,
                    name,
                    role: "PROPRIETAIRE",
                }
            })
        }

    } catch (error) {
        console.error(error)
    }
}


const generateUniqueId = async (): Promise<string> => {
    let uniqueId: string = '';
    let isUnique = false;

    while (!isUnique) {
        uniqueId = randomBytes(3).toString('hex');
        const existingInvoice = await prisma.invoice.findUnique({
            where: { id: uniqueId }
        });
        if (!existingInvoice) {
            isUnique = true;
        }
    }
    return uniqueId; // Garanti de retourner une string
};

export async function createEmptyInvoice(email: string, name: string, shopId?: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { shop: true }
        });

        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        // Vérification du shopId
        const finalShopId = shopId || user.shop?.id;
        if (!finalShopId) {
            throw new Error("L'utilisateur n'est associé à aucune boutique");
        }

        // Génération de l'ID (garanti non-undefined)
        const invoiceId = await generateUniqueId();

        return await prisma.invoice.create({
            data: {
                id: invoiceId, // Maintenant garanti comme string
                name: name,
                issuerName: "",
                issuerAddress: "",
                clientName: "",
                clientAddress: "",
                invoiceDate: "",
                dueDate: "",
                vatActive: false,
                vatRate: 20,
                status: 1,
                userId: user.id,
                shopId: finalShopId // Déjà validé
            },
            include: {
                shop: true,
                lines: true
            }
        });
    } catch (error) {
        console.error("Erreur création facture:", error);
        throw error;
    }
}
  
export async function getInvoicesByEmail(email: string) {
    if (!email) return;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            include: {
                invoices: {
                    include: {
                        lines: true,
                    }
                }
            }
        })
        // Statuts possibles :
        // 1: Brouillon
        // 2: En attente
        // 3: Payée
        // 4: Annulée
        // 5: Impayé
        if (user) {
            const today = new Date()
            const updatedInvoices = await Promise.all(
                user.invoices.map(async (invoice) => {
                    const dueDate = new Date(invoice.dueDate)
                    if (
                        dueDate < today &&
                        invoice.status == 2
                    ) {
                        const updatedInvoice = await prisma.invoice.update({
                            where: { id: invoice.id },
                            data: { status: 5 },
                            include: { lines: true }
                        })
                        return updatedInvoice
                    }
                    return invoice
                })
            )
            return updatedInvoices

        }
    } catch (error) {
        console.error(error)
    }
}
export async function deleteShopById(id: string) {
  return await prisma.shop.delete({
    where: { id }
  })
}
export async function getShopById(id: string) {
  return await prisma.shop.findUnique({
    where: { id }
  })
}
export async function updateShop(id: string, data: {
  name: string
  address: string
  phone: string
  ninea: string
}) {
  return await prisma.shop.update({
    where: { id },
    data
  })
}

export async function getInvoiceById(invoiceId: string) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                lines: true,
                 shop: true
            }
        })
        if (!invoice) {
            throw new Error("Facture non trouvée.");
        }
        return invoice
    } catch (error) {
        console.error(error)
    }
}

export async function updateInvoice(invoice: Invoice) {
    try {
        const existingInvoice = await prisma.invoice.findUnique({
            where: { id: invoice.id },
            include: {
                lines: true
            }
        })

        if (!existingInvoice) {
            throw new Error(`Facture avec l'ID ${invoice.id} introuvable.`);
        }

        await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                issuerName: invoice.issuerName,
                issuerAddress: invoice.issuerAddress,
                clientName: invoice.clientName,
                clientAddress: invoice.clientAddress,
                invoiceDate: invoice.invoiceDate,
                dueDate: invoice.dueDate,
                vatActive: invoice.vatActive,
                vatRate: invoice.vatRate,
                status: invoice.status,
            },
        })

        const existingLines = existingInvoice.lines

        const receivedLines = invoice.lines

        const linesToDelete = existingLines.filter(
            (existingLine) => !receivedLines.some((line) => line.id === existingLine.id)
        )

        if (linesToDelete.length > 0) {
            await prisma.invoiceLine.deleteMany({
                where: {
                    id: { in: linesToDelete.map((line) => line.id) }
                }
            })
        }

        for (const line of receivedLines) {
            const existingLine = existingLines.find((l) => l.id == line.id)
            if (existingLine) {
                const hasChanged =
                    line.description !== existingLine.description ||
                    line.quantity !== existingLine.quantity ||
                    line.unitPrice !== existingLine.unitPrice;

                if (hasChanged) {
                    await prisma.invoiceLine.update({
                        where: { id: line.id },
                        data: {
                            description: line.description,
                            quantity: line.quantity,
                            unitPrice: line.unitPrice,

                        }
                    })
                }
            } else {
                //créer une nouvelle ligne
                await prisma.invoiceLine.create({
                    data: {
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        invoiceId: invoice.id,
                          productId: line.productId, // Assurez-vous que productId est inclus dans l'objet line
                    }
                })

            }
        }

    } catch (error) {
        console.error(error)
    }
}

export async function deleteInvoice(invoiceId: string) {
    try {
        const deleteInvoice = await prisma.invoice.delete({
            where: { id: invoiceId }
        })
        if (!deleteInvoice) {
            throw new Error("Erreur lors de la suppression de la facture.");
        }
    } catch (error) {
        console.error(error)
    }
}

export async function createShop({
  name,
  address, // Maintenant compatible avec le schéma
  phone,
  ninea,
  userEmail
}: {
  name: string
  address: string
  phone: string
  ninea: string
  userEmail: string
}) {
  const owner = await prisma.user.findUnique({ 
    where: { email: userEmail } 
  })
  
  if (!owner) throw new Error("Utilisateur non trouvé")

  return await prisma.$transaction(async (tx) => {
    const shop = await tx.shop.create({
      data: {
        name,
        address,
        phone,
        ninea,
        owner: { connect: { id: owner.id } }
      }
    })

    await tx.user.update({
      where: { id: owner.id },
      data: { 
        shopId: shop.id,
        role: "PROPRIETAIRE" // Mise à jour du rôle
      }
    })

    return shop
  })
}

  export async function checkIfUserHasShop(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { shop: true }
    })
  
    return user?.shop ? true : false
  }
  
  export async function getShops() {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        owner: true,
        users: true,
        invoices: true
      }
    });
    return shops;
  } catch (error) {
    console.error("Erreur lors du chargement des boutiques :", error);
    return [];
  }
}
export async function getShopsByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { 
      shopsOwned: {
        include: {
          invoices: {
            select: { id: true }
          }
        }
      }
    }
  })
  return user?.shopsOwned || []
}
export async function getInvoicesByShop(shopId: string) {
  try {
    return await prisma.invoice.findMany({
      where: { shopId },
      include: {
        lines: true,
        shop: true // Important pour le typage
      }
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}
  // --------------------------
// 🟨 CATEGORIES
// --------------------------

export async function createCategory(data: { name: string; shopId: string }) {
  return await prisma.category.create({
    data: {
      name: data.name,
      shopId: data.shopId,
    },
  });
}


export async function getCategoriesByShop(shopId: string) {
  return await prisma.category.findMany({
    where: { shopId },
    orderBy: { name: "asc" },
    
  })
}

export async function updateCategory(id: string, name: string) {
  return await prisma.category.update({
    where: { id },
    data: { name },
  })
}

export async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: { id },
  })
}
// --------------------------
// 🟦 PRODUITS
// --------------------------

export async function createProduct(data: {
  name: string
  price: number
  quantity: number
  imageUrl?: string
  barcode?: string
  categoryId: string
  shopId: string
}) {
  const product = await prisma.product.create({
    data: {
      ...data
    }
  })

  // Enregistre le stock initial comme mouvement ENTRY
 

  return product
}

export async function getProductsByShop(shopId: string) {
  return await prisma.product.findMany({
    where: { shopId },
    include: {
      category: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateProduct(id: string, data: {
  name: string
  price: number
  imageUrl?: string
  barcode?: string
  categoryId: string
}) {
  return await prisma.product.update({
    where: { id },
    data
  })
}

export async function deleteProduct(id: string) {
  const relatedInvoiceLines = await prisma.invoiceLine.findFirst({
    where: { productId: id },
  });

  const relatedStockMovements = await prisma.stockMovement.findFirst({
    where: { productId: id },
  });

  if (relatedInvoiceLines || relatedStockMovements) {
    throw new Error("Impossible de supprimer ce produit car il est utilisé ailleurs.");
  }

  return await prisma.product.delete({
    where: { id },
  });
}


// --------------------------
// 🔁 MOUVEMENT DE STOCK
// --------------------------

export async function addMultipleStockMovements(movements: {
  productId: string,
  quantity: number,
  shopId: string,
  type: MovementType
}[]) {
  return await prisma.$transaction(async (tx) => {
   
const createdMovements: StockMovement[] = []
    for (const m of movements) {
      const created = await tx.stockMovement.create({
        data: {
          productId: m.productId,
          quantity: Math.abs(m.quantity),
          type: m.type, // ✅ maintenant dynamique
          shopId: m.shopId,
        },
      });

      // Mise à jour du stock
      await tx.product.update({
        where: { id: m.productId },
        data: {
          quantity: m.type === "ENTRY"
    ? { increment: Math.abs(m.quantity) }
    : m.type === "EXIT"
    ? { decrement: Math.abs(m.quantity) }
    : m.type === "ADJUSTMENT"
    ? { set: Math.abs(m.quantity) }
    : undefined,
        },
      });

      createdMovements.push(created);
    }

    return createdMovements;
  });
}

export async function getStockEntryHistoryByShop(shopId: string) {
  return await prisma.stockMovement.findMany({
    where: {
      shopId: shopId,
      type: MovementType.ENTRY,
    },
    include: {
      product: true, // Pour entry.product.name
      shop: true     // Pour entry.shop.name
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function addInvoicePayment(invoiceId: string, data: {
  amount: number,
  method: string,
  received: number,
  change: number
}) {
  const total = await calculateTotal(invoiceId);

  // ✅ Récupère la facture avec ses paiements
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true }, // 👈 nécessaire pour le calcul totalAlreadyPaid
  });

  if (!invoice) throw new Error("Facture introuvable");

  const totalAlreadyPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const newTotalPaid = totalAlreadyPaid + data.amount;

  // 🛑 Empêche de payer une facture déjà totalement payée
  if (totalAlreadyPaid >= total) {
    throw new Error("Cette facture est déjà complètement payée.");
  }

  // ✅ Détermine le nouveau statut
  const newStatus =
    newTotalPaid <= 0
      ? 5 // impayée
      : newTotalPaid < total
        ? 2 // partiellement payée
        : 3; // payée complète

  // ✅ Crée le nouveau paiement
  await prisma.invoicePayment.create({
    data: {
      invoiceId,
      amount: data.amount,
      method: data.method,
      receivedAmount: data.received,
      changeGiven: data.change,
      receivedAt: new Date()
    },
  });

  // ✅ Met à jour la facture avec les infos de paiement
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: newStatus,
      paidAmount: newTotalPaid,
      receivedAmount: data.received,
      changeGiven: data.change,
      paymentMethod: data.method,
    },
  });
}

async function calculateTotal(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { lines: true }
  });
  if (!invoice) return 0;
  
  const totalHT = invoice.lines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0);
  return totalHT + (invoice.vatActive ? totalHT * (invoice.vatRate / 100) : 0);
}


export async function getDashboardStats(shopId: string) {
  const boutiquesCount = await prisma.shop.count();

  const totalProducts = await prisma.product.count({
    where: { shopId }
  });

  const stockValue = await prisma.product.aggregate({
    where: { shopId },
    _sum: {
      quantity: true,
      price: true
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalSalesToday = await prisma.invoice.aggregate({
    where: {
      shopId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      }
    },
    _sum: {
      paidAmount: true, // ✅ On utilise paidAmount ici
    }
  });

  const unpaidInvoicesToday = await prisma.invoice.count({
    where: {
      shopId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      status: 5, // 5 = impayé (à adapter si ton statut est différent)
    },
  });

  return {
    boutiquesCount,
    totalProducts,
    stockValue: (stockValue._sum.quantity ?? 0) * (stockValue._sum.price ?? 0),
    totalSalesToday: totalSalesToday._sum.paidAmount ?? 0,
    unpaidInvoicesToday,
  };
}

export async function getSalesLast7Days(shopId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return date;
  });

  const results = await Promise.all(
    days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const sum = await prisma.invoice.aggregate({
        where: {
          shopId,
          createdAt: {
            gte: day,
            lt: nextDay,
          },
        },
        _sum: {
          paidAmount: true,
        },
      });

      return {
        date: day.toLocaleDateString("fr-FR", { weekday: "short" }),
        total: sum._sum.paidAmount ?? 0,
      };
    })
  );

  return results;
}
export async function getLowStockProducts(shopId: string, threshold: number = 5) {
  return await prisma.product.findMany({
    where: {
      shopId,
      quantity: {
        lt: threshold
      }
    },
    select: {
      name: true,
      quantity: true
    },
    orderBy: {
      quantity: "asc"
    }
  });
}
export async function getMonthlySales(shopId: string) {
  const now = new Date();
  const currentYear = now.getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => i); // 0 à 11

  const results = await Promise.all(
    months.map(async (month) => {
      const start = new Date(currentYear, month, 1);
      const end = new Date(currentYear, month + 1, 1);

      const total = await prisma.invoice.aggregate({
        where: {
          shopId,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
        _sum: {
          paidAmount: true,
        },
      });

      return {
        month: start.toLocaleString("fr-FR", { month: "short" }),
        total: total._sum.paidAmount ?? 0,
      };
    })
  );

  return results;
}


