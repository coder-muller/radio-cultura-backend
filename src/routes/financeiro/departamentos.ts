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

    const departamentos = await prisma.departamento.findMany({
        where: { chave: chave }
    });

    res.json(departamentos);
});

router.post("/", async (req, res) => {
    const { chave, descricao } = req.body;

    if (!chave || !descricao || !chave.trim() || !descricao.trim()) {
        res.status(400).json({ error: "Chave e descrição são obrigatórios" });
        return;
    }

    const departamento = await prisma.departamento.create({
        data: {
            chave,
            descricao
        }
    });

    res.json(departamento);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { descricao } = req.body;

    if (!descricao || !descricao.trim() || isNaN(parseInt(id))) {
        res.status(400).json({ error: "Descrição e ID são obrigatórios" });
        return;
    }

    const departamento = await prisma.departamento.update({
        where: { id: parseInt(id) },
        data: { descricao }
    });

    res.json(departamento);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const departamento = await prisma.departamento.delete({
        where: { id: parseInt(id) }
    });

    res.json(departamento);
});

export default router;