import { PrismaClient } from "@prisma/client";

// Déclaration pour TypeScript (évite les erreurs de type)
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialisation optimisée du client
const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});

// Conservation de l'instance en développement seulement
if (process.env.NODE_ENV === "development") {
  globalThis.prisma = prisma;
}

export default prisma;