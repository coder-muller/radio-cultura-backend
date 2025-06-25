import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import categorias from "./routes/financeiro/categorias";
import departamentos from "./routes/financeiro/departamentos";
import lancamentos from "./routes/financeiro/lancamentos";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5555;
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors())

app.use("/financeiro/categorias", categorias);
app.use("/financeiro/departamentos", departamentos);
app.use("/financeiro/lancamentos", lancamentos);

app.get("/", (req, res) => {
    res.send("Bem vindo ao servidor da Radio Cultura!");
});

// Clientes /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/clientes/:chave", async (req, res) => {
    const chave = req.params.chave;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const clientes = await prisma.cliente.findMany({
            where: {
                chave: chave,
            },
            orderBy: {
                nomeFantasia: "asc"
            }
        });

        res.json(clientes);
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        res.status(500).json({ error: "Erro ao buscar clientes" });
    }
});

app.get("/clientes/:chave/:id", async (req, res) => {
    const chave = req.params.chave;
    const id = parseInt(req.params.id);

    if (!chave || isNaN(id)) {
        res.status(400).json({ error: "Chave de acesso ou ID inválidos" });
        return;
    }
    try {
        const cliente = await prisma.cliente.findUnique({
            where: {
                id: id,
                chave: chave,
            },
        });

        if (!cliente) {
            res.status(404).json({ error: "Cliente não encontrado" });
            return;
        }

        res.json(cliente);
    } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        res.status(500).json({ error: "Erro ao buscar cliente" });
    }
});

app.post("/clientes", async (req, res) => {
    const {
        chave,
        razaoSocial,
        nomeFantasia,
        contato,
        cpf,
        cnpj,
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        inscMunicipal,
        atividade,
        email,
        fone
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const cliente = await prisma.cliente.create({
            data: {
                chave,
                razaoSocial,
                nomeFantasia,
                contato,
                cpf,
                cnpj,
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                cep,
                inscMunicipal,
                atividade,
                email,
                fone
            },
        });

        await prisma.logs.create({
            data: {
                chave: cliente.chave,
                tipo: "Insersão",
                tabela: "Clientes",
                mensagem: `Criado cliente: ${cliente.id} - ${cliente.nomeFantasia}`
            }
        })

        res.json(cliente);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        res.status(500).json({ error: "Erro ao criar cliente" });
    }
});

app.post("/dev/clientes", async (req, res) => {
    const {
        id,
        chave,
        razaoSocial,
        nomeFantasia,
        contato,
        cpf,
        cnpj,
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        inscMunicipal,
        atividade,
        email,
        fone
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const cliente = await prisma.cliente.create({
            data: {
                id: parseInt(id),
                chave,
                razaoSocial,
                nomeFantasia,
                contato,
                cpf,
                cnpj,
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                cep,
                inscMunicipal,
                atividade,
                email,
                fone
            },
        });
        res.json(cliente);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        res.status(500).json({ error: "Erro ao criar cliente" });
    }
});

app.put("/clientes/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const {
        chave,
        razaoSocial,
        nomeFantasia,
        contato,
        cpf,
        cnpj,
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        inscMunicipal,
        atividade,
        email,
        fone
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const cliente = await prisma.cliente.update({
            where: {
                id: id,
                chave: chave,
            },
            data: {
                razaoSocial,
                nomeFantasia,
                contato,
                cpf,
                cnpj,
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                cep,
                inscMunicipal,
                atividade,
                email,
                fone
            },
        });

        await prisma.logs.create({
            data: {
                chave: cliente.chave,
                tipo: "Edição",
                tabela: "Clientes",
                mensagem: `Alterado cliente: ${cliente.id} - ${cliente.nomeFantasia}`
            }
        })

        res.json(cliente);
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        res.status(500).json({ error: "Erro ao atualizar cliente" });
    }
});

app.delete("/clientes/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    try {
        const cliente = await prisma.cliente.delete({
            where: {
                id: id,
            },
        });

        await prisma.logs.create({
            data: {
                chave: cliente.chave,
                tipo: "Exclusão",
                tabela: "Clientes",
                mensagem: `Excluído cliente com id: ${id}, Nome Fantesia: ${cliente.nomeFantasia}`,
            }
        })

        res.json(cliente);
    } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        res.status(500).json({ error: "Erro ao excluir cliente" });
    }
});

// Contratos /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/contratos/:chave", async (req, res) => {
    const chave = req.params.chave;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const contratos = await prisma.contrato.findMany({
            where: {
                chave: chave,
            },
            include: {
                cliente: true,
                programacao: true,
                formaPagamento: true
            },
            orderBy: [
                { dataVencimento: 'asc' },
                { cliente: { nomeFantasia: 'asc' } }
            ]
        });
        res.json(contratos);
    } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        res.status(500).json({ error: "Erro ao buscar contratos" });
    }
});

app.get("/contratos/:chave/:id", async (req, res) => {
    const chave = req.params.chave;
    const id = parseInt(req.params.id);

    if (!chave || isNaN(id)) {
        res.status(400).json({ error: "Chave de acesso ou ID inválidos" });
        return;
    }

    try {
        const contrato = await prisma.contrato.findUnique({
            where: {
                id: id,
                chave: chave,
            },
            include: {
                cliente: true,
                programacao: true,
                formaPagamento: true
            }
        });

        if (!contrato) {
            res.status(404).json({ error: "Contrato não encontrado" });
            return;
        }

        res.json(contrato);
    } catch (error) {
        console.error("Erro ao buscar contrato:", error);
        res.status(500).json({ error: "Erro ao buscar contrato" });
    }
});

app.post("/contratos", async (req, res) => {
    const {
        chave,
        clienteId,
        dataEmissao,
        dataVencimento,
        programaId,
        numInsercoes,
        valor,
        corretorId,
        comissao,
        diaVencimento,
        formaPagamentoId,
        status,
        descritivo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const contrato = await prisma.contrato.create({
            data: {
                chave,
                clienteId: parseInt(clienteId),
                dataEmissao: dataEmissao ? new Date(dataEmissao) : null,
                dataVencimento: new Date(dataVencimento),
                programaId: parseInt(programaId),
                numInsercoes: parseInt(numInsercoes),
                valor: parseFloat(valor),
                corretorId: parseInt(corretorId),
                comissao: parseFloat(comissao),
                diaVencimento: parseInt(diaVencimento),
                formaPagamentoId: parseInt(formaPagamentoId),
                status,
                descritivo
            },
            include: {
                cliente: true
            }
        });

        await prisma.logs.create({
            data: {
                chave: contrato.chave,
                tipo: "Insersão",
                tabela: "Contratos",
                mensagem: `Criado contrato com id: ${contrato.id}, Nome Fantasia: ${contrato.cliente.nomeFantasia}`,
            }
        })

        res.json(contrato);
    } catch (error) {
        console.error("Erro ao criar contrato:", error);
        res.status(500).json({ error: "Erro ao criar contrato" });
    }
});

app.post("/dev/contratos", async (req, res) => {
    const {
        id,
        chave,
        clienteId,
        dataEmissao,
        dataVencimento,
        programaId,
        numInsercoes,
        valor,
        corretorId,
        comissao,
        diaVencimento,
        formaPagamentoId,
        status,
        descritivo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const contrato = await prisma.contrato.create({
            data: {
                id: parseInt(id),
                chave,
                clienteId: parseInt(clienteId),
                dataEmissao: dataEmissao ? new Date(dataEmissao) : null,
                dataVencimento: new Date(dataVencimento),
                programaId: parseInt(programaId),
                numInsercoes: parseInt(numInsercoes),
                valor: parseFloat(valor),
                corretorId: parseInt(corretorId),
                comissao: parseFloat(comissao),
                diaVencimento: parseInt(diaVencimento),
                formaPagamentoId: parseInt(formaPagamentoId),
                status,
                descritivo
            },
        });
        res.json(contrato);
    } catch (error) {
        console.error("Erro ao criar contrato:", error);
        res.status(500).json({ error: "Erro ao criar contrato" });
    }
});

app.put("/contratos/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const {
        chave,
        clienteId,
        dataEmissao,
        dataVencimento,
        programaId,
        numInsercoes,
        valor,
        corretorId,
        comissao,
        diaVencimento,
        formaPagamentoId,
        status,
        descritivo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const contrato = await prisma.contrato.update({
            where: {
                id: id,
                chave: chave,
            },
            data: {
                clienteId: parseInt(clienteId),
                dataEmissao: dataEmissao ? new Date(dataEmissao) : null,
                dataVencimento: new Date(dataVencimento),
                programaId: parseInt(programaId),
                numInsercoes: parseInt(numInsercoes),
                valor: parseFloat(valor),
                corretorId: parseInt(corretorId),
                comissao: parseFloat(comissao),
                diaVencimento: parseInt(diaVencimento),
                formaPagamentoId: parseInt(formaPagamentoId),
                status,
                descritivo
            },
            include: {
                cliente: true
            }
        });

        await prisma.logs.create({
            data: {
                chave: contrato.chave,
                tipo: "Edição",
                tabela: "Contratos",
                mensagem: `Edição de contrato com id: ${contrato.id}, Nome Fantasia: ${contrato.cliente.nomeFantasia}`,
            }
        })

        res.json(contrato);
    } catch (error) {
        console.error("Erro ao atualizar contrato:", error);
        res.status(500).json({ error: "Erro ao atualizar contrato" });
    }
});

app.delete("/contratos/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    try {
        const contrato = await prisma.contrato.delete({
            where: {
                id: id,
            },
            include: {
                cliente: true
            }
        });

        await prisma.logs.create({
            data: {
                chave: contrato.chave,
                tipo: "Exclusão",
                tabela: "Contratos",
                mensagem: `Excluído contrato com id: ${id}, Nome Fantesia do Cliente: ${contrato.cliente.nomeFantasia}`,
            }
        })

        res.json(contrato);
    } catch (error) {
        console.error("Erro ao excluir contrato:", error);
        res.status(500).json({ error: "Erro ao excluir contrato" });
    }
});

// Faturamento /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/faturamento/:chave", async (req, res) => {
    const chave = req.params.chave;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const faturamentos = await prisma.faturamento.findMany({
            where: {
                chave: chave,
            },
            include: {
                cliente: true,
                contrato: true,
                programa: true,
                corretores: true
            }
        });
        res.json(faturamentos);
    } catch (error) {
        console.error("Erro ao buscar faturamentos:", error);
        res.status(500).json({ error: "Erro ao buscar faturamentos" });
    }
});

app.get("/faturamento/:chave/:id", async (req, res) => {
    const chave = req.params.chave;
    const id = parseInt(req.params.id);

    if (!chave || isNaN(id)) {
        res.status(400).json({ error: "Chave de acesso ou ID inválidos" });
        return;
    }

    try {
        const faturamento = await prisma.faturamento.findUnique({
            where: {
                id: id,
                chave: chave,
            },
            include: {
                cliente: true,
                contrato: true,
                programa: true,
                corretores: true
            }
        });

        if (!faturamento) {
            res.status(404).json({ error: "Faturamento não encontrado" });
            return;
        }

        res.json(faturamento);
    } catch (error) {
        console.error("Erro ao buscar faturamento:", error);
        res.status(500).json({ error: "Erro ao buscar faturamento" });
    }
});

app.get("/faturamento/:chave/:id/pendentes", async (req, res) => {
    const chave = req.params.chave;
    const id = parseInt(req.params.id);

    if (!chave || isNaN(id)) {
        res.status(400).json({ error: "Chave de acesso ou ID inválidos" });
        return;
    }

    try {
        const faturamentos = await prisma.faturamento.findMany({
            where: {
                chave: chave,
                contratoId: id,
                dataPagamento: null
            },
            include: {
                cliente: true,
                contrato: true,
                programa: true,
                corretores: true
            }
        });

        if (!faturamentos) {
            res.status(404).json({ error: "Faturamentos não encontrados" });
            return;
        }

        res.json(faturamentos);
    } catch (error) {
        console.error("Erro ao buscar faturamentos:", error);
        res.status(500).json({ error: "Erro ao buscar faturamentos" });
    }
});

app.post("/faturamento", async (req, res) => {
    const {
        chave,
        clienteId,
        contratoId,
        programaId,
        corretoresId,
        comissao,
        dataEmissao,
        dataVencimento,
        dataPagamento,
        valor,
        formaPagamentoId,
        descritivo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const faturamento = await prisma.faturamento.create({
            data: {
                chave,
                clienteId: parseInt(clienteId),
                contratoId: parseInt(contratoId),
                programaId: parseInt(programaId),
                corretoresId: corretoresId ? parseInt(corretoresId) : null,
                comissao: parseFloat(comissao),
                dataEmissao: dataEmissao ? new Date(dataEmissao) : null,
                dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
                dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
                valor: parseFloat(valor),
                formaPagamentoId: formaPagamentoId ? parseInt(formaPagamentoId) : null,
                descritivo
            },
        });
        res.json(faturamento);
    } catch (error) {
        console.error("Erro ao criar faturamento:", error);
        res.status(500).json({ error: "Erro ao criar faturamento" });
    }
});

app.post("/dev/faturamento", async (req, res) => {
    const {
        id,
        chave,
        clienteId,
        contratoId,
        programaId,
        corretoresId,
        comissao,
        dataEmissao,
        dataVencimento,
        dataPagamento,
        valor,
        formaPagamentoId,
        descritivo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const faturamento = await prisma.faturamento.create({
            data: {
                id: parseInt(id),
                chave,
                clienteId: parseInt(clienteId),
                contratoId: parseInt(contratoId),
                programaId: parseInt(programaId),
                corretoresId: corretoresId ? parseInt(corretoresId) : null,
                comissao: parseFloat(comissao),
                dataEmissao: dataEmissao ? new Date(dataEmissao) : null,
                dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
                dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
                valor: parseFloat(valor),
                formaPagamentoId: formaPagamentoId ? parseInt(formaPagamentoId) : null,
                descritivo
            },
        });
        res.json(faturamento);
    } catch (error) {
        console.error("Erro ao criar faturamento:", error);
        res.status(500).json({ error: "Erro ao criar faturamento" });
    }
});

app.put("/faturamento/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const {
        chave,
        clienteId,
        contratoId,
        programaId,
        corretoresId,
        comissao,
        dataEmissao,
        dataVencimento,
        dataPagamento,
        valor,
        formaPagamentoId,
        descritivo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const faturamento = await prisma.faturamento.update({
            where: {
                id: id,
                chave: chave,
            },
            data: {
                clienteId: parseInt(clienteId),
                contratoId: parseInt(contratoId),
                programaId: parseInt(programaId),
                corretoresId: corretoresId ? parseInt(corretoresId) : null,
                comissao: parseFloat(comissao),
                dataEmissao: dataEmissao ? new Date(dataEmissao) : null,
                dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
                dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
                valor: parseFloat(valor),
                formaPagamentoId: formaPagamentoId ? parseInt(formaPagamentoId) : null,
                descritivo
            },
        });
        res.json(faturamento);
    } catch (error) {
        console.error("Erro ao atualizar faturamento:", error);
        res.status(500).json({ error: "Erro ao atualizar faturamento" });
    }
});

app.put('/faturamento/:id/pagamento', async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const {
        dataPagamento,
        formaPagamentoId
    } = req.body;

    if (!dataPagamento) {
        res.status(400).json({ error: "Data de pagamento não fornecida" });
        return;
    } else if (!formaPagamentoId) {
        res.status(400).json({ error: "Forma de pagamento não fornecida" });
        return;
    } else if (isNaN(parseInt(formaPagamentoId))) {
        res.status(400).json({ error: "Forma de pagamento inválida" });
        return;
    }

    try {
        const faturamento = await prisma.faturamento.update({
            where: {
                id: id,
            },
            data: {
                dataPagamento: new Date(dataPagamento),
                formaPagamentoId: parseInt(formaPagamentoId),
            },
            include: {
                cliente: true
            }
        });

        const categoriaBase = await prisma.categoria.findFirst({
            where: {
                chave: faturamento.chave,
                descricao: "Faturamento"
            }
        })

        if (!categoriaBase) {
            res.status(400).json({ error: "Categoria base não encontrada" });
            return;
        }

        const departamentoBase = await prisma.departamento.findFirst({
            where: {
                chave: faturamento.chave,
                descricao: "Empresa"
            }
        })

        if (!departamentoBase) {
            res.status(400).json({ error: "Departamento base não encontrada" });
            return;
        }

        await prisma.lancamento.create({
            data: {
                chave: faturamento.chave,
                descricao: "Recebido de " + faturamento.cliente.nomeFantasia,
                valor: parseFloat(faturamento.valor?.toString() || "0"),
                data: new Date(dataPagamento),
                natureza: "receita",
                categoriaId: categoriaBase.id,
                departamentoId: departamentoBase.id,
                faturaId: faturamento.id,
            }
        })

        await prisma.logs.create({
            data: {
                chave: faturamento.chave,
                tipo: "Pagamento",
                tabela: "Faturamento",
                mensagem: `Pagamento da fatura com id: ${faturamento.id} realizado.`
            }
        })

        res.json(faturamento);
    } catch (error) {
        console.error("Erro ao atualizar faturamento:", error);
        res.status(500).json({ error: "Erro ao atualizar faturamento" });
    }
});




app.delete("/faturamento/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    try {

        await prisma.lancamento.deleteMany({
            where: {
                faturaId: id,
            }
        })

        const faturamento = await prisma.faturamento.delete({
            where: {
                id: id,
            },
            include: {
                cliente: true,
            }
        });

        await prisma.logs.create({
            data: {
                chave: faturamento.chave,
                tipo: "Exclusão",
                tabela: "Faturamento",
                mensagem: `Excluído fatura com id: ${id}, Nome Fantesia do Cliente: ${faturamento.cliente.nomeFantasia} com valor de: R$${faturamento.valor?.toFixed(2).toString().replace('.', ',')} e com vencimento para: ${faturamento.dataVencimento?.toLocaleDateString('pt-BR')} que ${faturamento.dataPagamento ? 'já foi paga' : 'ainda não foi paga'}`,
            }
        })

        res.json(faturamento);
    } catch (error) {
        console.error("Erro ao excluir faturamento:", error);
        res.status(500).json({ error: "Erro ao excluir faturamento" });
    }
});

// Corretores /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/corretores/:chave", async (req, res) => {
    const chave = req.params.chave;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const corretores = await prisma.corretores.findMany({
            where: {
                chave: chave,
            },
            orderBy: {
                nome: 'asc'
            }
        });
        res.json(corretores);
    } catch (error) {
        console.error("Erro ao buscar corretores:", error);
        res.status(500).json({ error: "Erro ao buscar corretores" });
    }
});

app.get("/corretores/:chave/:id", async (req, res) => {
    const chave = req.params.chave;
    const id = parseInt(req.params.id);

    if (!chave || isNaN(id)) {
        res.status(400).json({ error: "Chave de acesso ou ID inválidos" });
        return;
    }

    try {
        const corretor = await prisma.corretores.findUnique({
            where: {
                id: id,
                chave: chave,
            },
        });

        if (!corretor) {
            res.status(404).json({ error: "Corretor não encontrado" });
            return;
        }

        res.json(corretor);
    } catch (error) {
        console.error("Erro ao buscar corretor:", error);
        res.status(500).json({ error: "Erro ao buscar corretor" });
    }
});

app.post("/corretores", async (req, res) => {
    const {
        chave,
        nome,
        endereco,
        email,
        fone,
        dataAdmissao
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const corretor = await prisma.corretores.create({
            data: {
                chave,
                nome,
                endereco,
                email,
                fone,
                dataAdmissao: dataAdmissao ? new Date(dataAdmissao) : null
            },
        });

        await prisma.logs.create({
            data: {
                chave: chave,
                tipo: "Insersão",
                tabela: "Corretores",
                mensagem: `Criado corretor com id: ${corretor.id}, Nome: ${corretor.nome}`
            }
        })

        res.json(corretor);
    } catch (error) {
        console.error("Erro ao criar corretor:", error);
        res.status(500).json({ error: "Erro ao criar corretor" });
    }
});

app.post("/dev/corretores", async (req, res) => {
    const {
        id,
        chave,
        nome,
        endereco,
        email,
        fone,
        dataAdmissao
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const corretor = await prisma.corretores.create({
            data: {
                id: parseInt(id),
                chave,
                nome,
                endereco,
                email,
                fone,
                dataAdmissao: dataAdmissao ? new Date(dataAdmissao) : null
            },
        });
        res.json(corretor);
    } catch (error) {
        console.error("Erro ao criar corretor:", error);
        res.status(500).json({ error: "Erro ao criar corretor" });
    }
});

app.put("/corretores/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const {
        chave,
        nome,
        endereco,
        email,
        fone,
        dataAdmissao
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const corretor = await prisma.corretores.update({
            where: {
                id: id,
                chave: chave,
            },
            data: {
                nome,
                endereco,
                email,
                fone,
                dataAdmissao: dataAdmissao ? new Date(dataAdmissao) : null
            },
        });

        await prisma.logs.create({
            data: {
                chave: chave,
                tipo: "Edição",
                tabela: "Corretores",
                mensagem: `Edição de corretor com id: ${corretor.id}, Nome: ${corretor.nome}`
            }
        })

        res.json(corretor);
    } catch (error) {
        console.error("Erro ao atualizar corretor:", error);
        res.status(500).json({ error: "Erro ao atualizar corretor" });
    }
});

app.delete("/corretores/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const contratosAtivos = await prisma.contrato.count({
        where: {
            corretorId: id,
        }
    });

    if (contratosAtivos > 0) {
        res.status(400).json({ error: "Corretor possui contratos ativos" });
        return;
    }

    try {
        const corretor = await prisma.corretores.delete({
            where: {
                id: id,
            },
        });

        await prisma.logs.create({
            data: {
                chave: corretor.chave,
                tipo: "Exclusão",
                tabela: "Corretores",
                mensagem: `Excluído corretor com id: ${id}, Nome: ${corretor.nome}`,
            }
        })

        res.json(corretor);
    } catch (error) {
        console.error("Erro ao excluir corretor:", error);
        res.status(500).json({ error: "Erro ao excluir corretor" });
    }
});

// FormaPagamento /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/forma-pagamento/:chave", async (req, res) => {
    const chave = req.params.chave;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const formasPagamento = await prisma.formaPagamento.findMany({
            where: {
                chave: chave,
            },
        });
        res.json(formasPagamento);
    } catch (error) {
        console.error("Erro ao buscar formas de pagamento:", error);
        res.status(500).json({ error: "Erro ao buscar formas de pagamento" });
    }
});

app.get("/forma-pagamento/:chave/:id", async (req, res) => {
    const chave = req.params.chave;
    const id = parseInt(req.params.id);

    if (!chave || isNaN(id)) {
        res.status(400).json({ error: "Chave de acesso ou ID inválidos" });
        return;
    }

    try {
        const formaPagamento = await prisma.formaPagamento.findUnique({
            where: {
                id: id,
                chave: chave,
            },
        });

        if (!formaPagamento) {
            res.status(404).json({ error: "Forma de pagamento não encontrada" });
            return;
        }

        res.json(formaPagamento);
    } catch (error) {
        console.error("Erro ao buscar forma de pagamento:", error);
        res.status(500).json({ error: "Erro ao buscar forma de pagamento" });
    }
});

app.post("/forma-pagamento", async (req, res) => {
    const {
        chave,
        formaPagamento
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const novaFormaPagamento = await prisma.formaPagamento.create({
            data: {
                chave,
                formaPagamento
            },
        });

        await prisma.logs.create({
            data: {
                chave: chave,
                tipo: "Insersão",
                tabela: "FormasPagamento",
                mensagem: `Criada forma de pagamento com id: ${novaFormaPagamento.id}, Nome: ${novaFormaPagamento.formaPagamento}`,
            }
        })

        res.json(novaFormaPagamento);
    } catch (error) {
        console.error("Erro ao criar forma de pagamento:", error);
        res.status(500).json({ error: "Erro ao criar forma de pagamento" });
    }
});

app.post("/dev/forma-pagamento", async (req, res) => {
    const {
        id,
        chave,
        formaPagamento
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const novaFormaPagamento = await prisma.formaPagamento.create({
            data: {
                id: parseInt(id),
                chave,
                formaPagamento
            },
        });
        res.json(novaFormaPagamento);
    } catch (error) {
        console.error("Erro ao criar forma de pagamento:", error);
        res.status(500).json({ error: "Erro ao criar forma de pagamento" });
    }
});

app.put("/forma-pagamento/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const {
        chave,
        formaPagamento
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const updatedFormaPagamento = await prisma.formaPagamento.update({
            where: {
                id: id,
                chave: chave,
            },
            data: {
                formaPagamento
            },
        });

        await prisma.logs.create({
            data: {
                chave: chave,
                tipo: "Edição",
                tabela: "FormasPagamento",
                mensagem: `Edição de forma de pagamento com id: ${updatedFormaPagamento.id}, Nome: ${updatedFormaPagamento.formaPagamento}`,
            }
        })

        res.json(updatedFormaPagamento);
    } catch (error) {
        console.error("Erro ao atualizar forma de pagamento:", error);
        res.status(500).json({ error: "Erro ao atualizar forma de pagamento" });
    }
});

app.delete("/forma-pagamento/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const contratosAtivos = await prisma.contrato.findMany({
        where: {
            formaPagamentoId: id,
        },
    });

    if (contratosAtivos.length > 0) {
        res.status(400).json({ error: "Não é possível excluir esta forma de pagamento pois há contratos ativos com ela." });
        return;
    }

    try {
        const formaPagamento = await prisma.formaPagamento.delete({
            where: {
                id: id,
            },
        });

        await prisma.logs.create({
            data: {
                chave: formaPagamento.chave,
                tipo: "Exclusão",
                tabela: "FormasPagamento",
                mensagem: `Excluído forma de pagamento com id: ${id}, Forma de Pagamento: ${formaPagamento.formaPagamento}`,
            }
        });

        res.json(formaPagamento);
    } catch (error) {
        console.error("Erro ao excluir forma de pagamento:", error);
        res.status(500).json({ error: "Erro ao excluir forma de pagamento" });
    }
});

// Programacao /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/programacao/:chave", async (req, res) => {
    const chave = req.params.chave;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const programacoes = await prisma.programacao.findMany({
            where: {
                chave: chave,
            },
            orderBy: {
                programa: 'asc'
            }
        });
        res.json(programacoes);
    } catch (error) {
        console.error("Erro ao buscar programações:", error);
        res.status(500).json({ error: "Erro ao buscar programações" });
    }
});

app.get("/programacao/:chave/:id", async (req, res) => {
    const chave = req.params.chave;
    const id = parseInt(req.params.id);

    if (!chave || isNaN(id)) {
        res.status(400).json({ error: "Chave de acesso ou ID inválidos" });
        return;
    }

    try {
        const programacao = await prisma.programacao.findUnique({
            where: {
                id: id,
                chave: chave,
            },
        });

        if (!programacao) {
            res.status(404).json({ error: "Programação não encontrada" });
            return;
        }

        res.json(programacao);
    } catch (error) {
        console.error("Erro ao buscar programação:", error);
        res.status(500).json({ error: "Erro ao buscar programação" });
    }
});

app.post("/programacao", async (req, res) => {
    const {
        chave,
        programa,
        horaInicio,
        horaFim,
        apresentador,
        diasApresentacao,
        valorPatrocinio,
        estilo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const programacao = await prisma.programacao.create({
            data: {
                chave,
                programa,
                horaInicio,
                horaFim,
                apresentador,
                diasApresentacao,
                valorPatrocinio: valorPatrocinio ? parseFloat(valorPatrocinio) : null,
                estilo
            },
        });

        await prisma.logs.create({
            data: {
                chave: programacao.chave,
                tipo: "Insersão",
                tabela: "Programacao",
                mensagem: `Criado programação com id: ${programacao.id}, Programa: ${programacao.programa}`,
            }
        });

        res.json(programacao);
    } catch (error) {
        console.error("Erro ao criar programação:", error);
        res.status(500).json({ error: "Erro ao criar programação" });
    }
});

app.post("/dev/programacao", async (req, res) => {
    const {
        id,
        chave,
        programa,
        horaInicio,
        horaFim,
        apresentador,
        diasApresentacao,
        valorPatrocinio,
        estilo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const programacao = await prisma.programacao.create({
            data: {
                id: parseInt(id),
                chave,
                programa,
                horaInicio,
                horaFim,
                apresentador,
                diasApresentacao,
                valorPatrocinio: valorPatrocinio ? parseFloat(valorPatrocinio) : null,
                estilo
            },
        });
        res.json(programacao);
    } catch (error) {
        console.error("Erro ao criar programação:", error);
        res.status(500).json({ error: "Erro ao criar programação" });
    }
});

app.put("/programacao/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const {
        chave,
        programa,
        horaInicio,
        horaFim,
        apresentador,
        diasApresentacao,
        valorPatrocinio,
        estilo
    } = req.body;

    if (!chave) {
        res.status(400).json({ error: "Chave de acesso não fornecida" });
        return;
    }

    try {
        const programacao = await prisma.programacao.update({
            where: {
                id: id,
                chave: chave,
            },
            data: {
                programa,
                horaInicio,
                horaFim,
                apresentador,
                diasApresentacao,
                valorPatrocinio: valorPatrocinio ? parseFloat(valorPatrocinio) : null,
                estilo
            },
        });

        await prisma.logs.create({
            data: {
                chave: programacao.chave,
                tipo: "Edição",
                tabela: "Programacao",
                mensagem: `Edição de programação com id: ${programacao.id}, Programa: ${programacao.programa}`,
            }
        });

        res.json(programacao);
    } catch (error) {
        console.error("Erro ao atualizar programação:", error);
        res.status(500).json({ error: "Erro ao atualizar programação" });
    }
});

app.delete("/programacao/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const contratosAtivos = await prisma.contrato.findMany({
        where: {
            programaId: id,
        },
    })

    if (contratosAtivos.length > 0) {
        res.status(400).json({ error: "Existem contratos vinculados para essa programação" });
        return;
    }

    try {
        const programacao = await prisma.programacao.delete({
            where: {
                id: id,
            },
        });
        res.json(programacao);

        await prisma.logs.create({
            data: {
                chave: programacao.chave,
                tipo: "Exclusão",
                tabela: "Programacao",
                mensagem: `Excluído programação com id: ${id}, Programa: ${programacao.programa}`,
            }
        });

    } catch (error) {
        console.error("Erro ao excluir programação:", error);
        res.status(500).json({ error: "Erro ao excluir programação" });
    }
});

// LOGs ////////////////////////////////////////////////////////////////////////////////////////
app.get('/logs/:chave', async (req, res) => {
    const chave = req.params.chave;

    try {
        const logs = await prisma.logs.findMany({
            where: {
                chave: chave,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(logs);
    } catch (error) {
        console.error("Erro ao buscar logs:", error);
        res.status(500).json({ error: "Erro ao buscar logs" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

