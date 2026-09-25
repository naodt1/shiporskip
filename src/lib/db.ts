import { PrismaClient } from "@prisma/client";
import { runtimeDbUrl } from "./db-url.mjs";

const g = globalThis as unknown as { prisma?: PrismaClient };

export const db = g.prisma ?? new PrismaClient({ datasourceUrl: runtimeDbUrl()?.url });

if (process.env.NODE_ENV !== "production") g.prisma = db;
