"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get("/:chave", async (req, res) => {
    const chave = req.params.chave;
    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }
    try {
        const categorias = await prisma.categoria.findMany({
            where: {
                chave: chave
            }
        });
        res.json(categorias);
    }
    catch (error) {
        console.error("Erro ao buscar categorias:", error);
        res.status(500).json({ error: "Erro ao buscar categorias" });
    }
});
router.post("/", async (req, res) => {
    const { chave, descricao } = req.body;
    if (!chave || !descricao || !chave.trim() || !descricao.trim()) {
        res.status(400).json({ error: "Chave e descrição são obrigatórios" });
        return;
    }
    try {
        const categoria = await prisma.categoria.create({
            data: {
                chave,
                descricao
            }
        });
        await prisma.logs.create({
            data: {
                chave: chave,
                mensagem: "Categoria criada",
                tipo: "Insersão",
                tabela: "Categorias"
            }
        });
        res.json(categoria);
    }
    catch (error) {
        console.error("Erro ao criar categoria:", error);
        res.status(500).json({ error: "Erro ao criar categoria" });
    }
});
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { descricao } = req.body;
    if (!descricao || !descricao.trim() || isNaN(parseInt(id))) {
        res.status(400).json({ error: "Descrição e ID são obrigatórios" });
        return;
    }
    try {
        const categoria = await prisma.categoria.update({
            where: { id: parseInt(id) },
            data: { descricao }
        });
        await prisma.logs.create({
            data: {
                chave: categoria.chave,
                mensagem: "Categoria atualizada",
                tipo: "Edição",
                tabela: "Categorias"
            }
        });
        res.json(categoria);
    }
    catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        res.status(500).json({ error: "Erro ao atualizar categoria" });
    }
});
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }
    try {
        const categoria = await prisma.categoria.delete({
            where: { id: parseInt(id) }
        });
        await prisma.logs.create({
            data: {
                chave: categoria.chave,
                mensagem: "Categoria deletada",
                tipo: "Exclusão",
                tabela: "Categorias"
            }
        });
        res.json(categoria);
    }
    catch (error) {
        console.error("Erro ao deletar categoria:", error);
        res.status(500).json({ error: "Erro ao deletar categoria" });
    }
});
exports.default = router;
