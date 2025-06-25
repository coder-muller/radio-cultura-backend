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
        const departamentos = await prisma.departamento.findMany({
            where: { chave: chave }
        });
        res.json(departamentos);
    }
    catch (error) {
        console.error("Erro ao buscar departamentos:", error);
        res.status(500).json({ error: "Erro ao buscar departamentos" });
    }
});
router.post("/", async (req, res) => {
    const { chave, descricao } = req.body;
    if (!chave || !descricao || !chave.trim() || !descricao.trim()) {
        res.status(400).json({ error: "Chave e descrição são obrigatórios" });
        return;
    }
    try {
        const departamento = await prisma.departamento.create({
            data: {
                chave,
                descricao
            }
        });
        await prisma.logs.create({
            data: {
                chave: departamento.chave,
                mensagem: "Departamento criado",
                tipo: "Insersão",
                tabela: "Departamentos"
            }
        });
        res.json(departamento);
    }
    catch (error) {
        console.error("Erro ao criar departamento:", error);
        res.status(500).json({ error: "Erro ao criar departamento" });
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
        const departamento = await prisma.departamento.update({
            where: { id: parseInt(id) },
            data: { descricao }
        });
        await prisma.logs.create({
            data: {
                chave: departamento.chave,
                mensagem: "Departamento atualizado",
                tipo: "Edição",
                tabela: "Departamentos"
            }
        });
        res.json(departamento);
    }
    catch (error) {
        console.error("Erro ao atualizar departamento:", error);
        res.status(500).json({ error: "Erro ao atualizar departamento" });
    }
});
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }
    try {
        const departamento = await prisma.departamento.delete({
            where: { id: parseInt(id) }
        });
        await prisma.logs.create({
            data: {
                chave: departamento.chave,
                mensagem: "Departamento deletado",
                tipo: "Exclusão",
                tabela: "Departamentos"
            }
        });
        res.json(departamento);
    }
    catch (error) {
        console.error("Erro ao deletar departamento:", error);
        res.status(500).json({ error: "Erro ao deletar departamento" });
    }
});
exports.default = router;
