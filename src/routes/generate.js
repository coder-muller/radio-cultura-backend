"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post("/:chave", async (req, res) => {
    const { chave } = req.params;
    if (!chave) {
        res.status(400).json({ error: "Chave não informada" });
        return;
    }
    // Todas as faturas pagas
    const faturas = await prisma.faturamento.findMany({
        where: {
            chave,
            dataPagamento: {
                not: null
            }
        },
        include: {
            contrato: true,
            cliente: true,
            programa: true,
            Lancamento: true
        }
    });
    if (faturas.length === 0) {
        res.status(400).json({ error: "Nenhuma fatura encontrada" });
        return;
    }
    const categorias = await prisma.categoria.findMany({
        where: {
            chave
        }
    });
    const departamentos = await prisma.departamento.findMany({
        where: {
            chave
        }
    });
    if (categorias.length === 0 || departamentos.length === 0) {
        await prisma.categoria.create({
            data: {
                descricao: "Faturamento",
                chave
            }
        });
        await prisma.departamento.create({
            data: {
                descricao: "Empresa",
                chave
            }
        });
    }
    // Busca a categoria e dapartamento padrão
    const categoriaPadrao = await prisma.categoria.findFirst({
        where: {
            descricao: "Faturamento"
        }
    });
    const departamentoPadrao = await prisma.departamento.findFirst({
        where: {
            descricao: "Empresa"
        }
    });
    if (!categoriaPadrao || !departamentoPadrao) {
        res.status(400).json({ error: "Categoria ou departamento padrão não encontrados" });
        return;
    }
    // Gerar um lancamento para cada fatura paga no seu respectivo dia
    for (const fatura of faturas) {
        if (fatura.Lancamento.length > 0) {
            continue;
        }
        if (!fatura.dataPagamento) {
            continue;
        }
        const dataPagamento = new Date(fatura.dataPagamento.toISOString().split("T")[0] + "T03:00:00.000Z");
        await prisma.lancamento.create({
            data: {
                descricao: `Recebido de ${fatura.cliente.nomeFantasia}`,
                valor: parseFloat(fatura.valor?.toString() || "0"),
                data: dataPagamento,
                natureza: "receita",
                categoriaId: categoriaPadrao.id,
                departamentoId: departamentoPadrao.id,
                faturaId: fatura.id,
                chave: fatura.chave
            }
        });
    }
    res.json({ message: "Faturas geradas com sucesso!" });
});
exports.default = router;
