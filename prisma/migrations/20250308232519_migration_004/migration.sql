/*
  Warnings:

  - Added the required column `tabela` to the `Logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Logs" ADD COLUMN     "tabela" TEXT NOT NULL;
