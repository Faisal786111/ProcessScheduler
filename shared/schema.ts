import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const processes = pgTable("processes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arrivalTime: integer("arrival_time").notNull(),
  burstTime: integer("burst_time").notNull(),
  priority: integer("priority").default(0),
});

export const processSchema = createInsertSchema(processes).pick({
  name: true,
  arrivalTime: true,
  burstTime: true,
  priority: true,
});

export type Process = typeof processes.$inferSelect;
export type InsertProcess = z.infer<typeof processSchema>;

export type AlgorithmType = 'FCFS' | 'RR' | 'Priority' | 'SJF' | 'SRTF';
