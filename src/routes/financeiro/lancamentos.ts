import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();

router.get("/:chave", async (req, res) => {
    const chave = req.params.chave;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    const lancamentos = await prisma.lancamento.findMany({
        where: { chave: chave }
    });

    res.json(lancamentos);
});

router.post("/", async (req, res) => {
    const { chave, descricao, valor, data, natureza, categoriaId, departamentoId, faturaId } = req.body;

    if (!chave || !descricao || !valor || !data || !natureza || !categoriaId || !departamentoId) {
        res.status(400).json({ error: "Chave, descrição, valor, data, natureza, categoriaId e departamentoId são obrigatórios" });
        return;
    }

    if (isNaN(parseInt(categoriaId)) || isNaN(parseInt(departamentoId))) {
        res.status(400).json({ error: "CategoriaId e departamentoId devem ser números" });
        return;
    }

    if (faturaId && isNaN(parseInt(faturaId))) {
        res.status(400).json({ error: "FaturaId deve ser um número" });
        return;
    }

    if (isNaN(parseFloat(valor))) {
        res.status(400).json({ error: "Valor deve ser um número" });
        return;
    }

    if (isNaN(new Date(data).getTime())) {
        res.status(400).json({ error: "Data inválida" });
        return;
    }

    const lancamento = await prisma.lancamento.create({
        data: { chave, descricao, valor: parseFloat(valor), data: new Date(data), natureza, categoriaId: parseInt(categoriaId), departamentoId: parseInt(departamentoId), faturaId: faturaId ? parseInt(faturaId) : null }
    });

    res.json(lancamento);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { descricao, valor, data, natureza, categoriaId, departamentoId, faturaId } = req.body;

    if (!descricao || !valor || !data || !natureza || !categoriaId || !departamentoId) {
        res.status(400).json({ error: "Descrição, valor, data, natureza, categoriaId e departamentoId são obrigatórios" });
        return;
    }

    if (isNaN(parseInt(categoriaId)) || isNaN(parseInt(departamentoId))) {
        res.status(400).json({ error: "CategoriaId e departamentoId devem ser números" });
        return;
    }

    if (faturaId && isNaN(parseInt(faturaId))) {
        res.status(400).json({ error: "FaturaId deve ser um número" });
        return;
    }

    if (isNaN(parseFloat(valor))) {
        res.status(400).json({ error: "Valor deve ser um número" });
        return;
    }

    if (isNaN(new Date(data).getTime())) {
        res.status(400).json({ error: "Data inválida" });
        return;
    }

    const lancamento = await prisma.lancamento.update({
        where: { id: parseInt(id) },
        data: { descricao, valor: parseFloat(valor), data: new Date(data), natureza, categoriaId: parseInt(categoriaId), departamentoId: parseInt(departamentoId), faturaId: faturaId ? parseInt(faturaId) : null }
    });

    res.json(lancamento);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const lancamento = await prisma.lancamento.delete({
        where: { id: parseInt(id) }
    });

    res.json(lancamento);
});

export default router;