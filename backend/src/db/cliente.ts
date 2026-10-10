import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "Falta la variable DATABASE_URL. Copiá backend/.env.example como backend/.env y completala."
    );
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
