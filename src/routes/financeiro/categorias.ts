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

    const categorias = await prisma.categoria.findMany({
        where: {
            chave: chave
        }
    });

    res.json(categorias);
});

router.post("/", async (req, res) => {
    const { chave, descricao } = req.body;

    if (!chave || !descricao || !chave.trim() || !descricao.trim()) {
        res.status(400).json({ error: "Chave e descrição são obrigatórios" });
        return;
    }

    const categoria = await prisma.categoria.create({
        data: {
            chave,
            descricao
        }
    });

    res.json(categoria);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { descricao } = req.body;

    if (!descricao || !descricao.trim() || isNaN(parseInt(id))) {
        res.status(400).json({ error: "Descrição e ID são obrigatórios" });
        return;
    }

    const categoria = await prisma.categoria.update({
        where: { id: parseInt(id) },
        data: { descricao }
    });

    res.json(categoria);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const categoria = await prisma.categoria.delete({
        where: { id: parseInt(id) }
    });

    res.json(categoria);
});

export default router;