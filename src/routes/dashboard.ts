import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();

router.get("/:chave", async (req: Request, res: Response): Promise<void> => {
    const { chave } = req.params;

    if (!chave) {
        res.status(400).json({ error: "Chave não informada" });
        return;
    }

    try {
        const dataAtual = new Date();
        const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
        const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);

        const dataAnterior = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1);
        const primeiroDiaMesAnterior = new Date(dataAnterior.getFullYear(), dataAnterior.getMonth(), 1);
        const ultimoDiaMesAnterior = new Date(dataAnterior.getFullYear(), dataAnterior.getMonth() + 1, 0);

        // Dados do mês atual
        const receitaMes = await prisma.lancamento.aggregate({
            where: {
                chave: chave,
                natureza: "receita",
                data: {
                    gte: primeiroDiaMes,
                    lte: ultimoDiaMes
                }
            },
            _sum: {
                valor: true
            }
        });

        const receitaMesAnterior = await prisma.lancamento.aggregate({
            where: {
                chave: chave,
                natureza: "receita",
                data: {
                    gte: primeiroDiaMesAnterior,
                    lte: ultimoDiaMesAnterior
                }
            },
            _sum: {
                valor: true
            }
        });

        const despesaMes = await prisma.lancamento.aggregate({
            where: {
                chave: chave,
                natureza: "despesa",
                data: {
                    gte: primeiroDiaMes,
                    lte: ultimoDiaMes
                }
            },
            _sum: {
                valor: true
            }
        });

        const despesaMesAnterior = await prisma.lancamento.aggregate({
            where: {
                chave: chave,
                natureza: "despesa",
                data: {
                    gte: primeiroDiaMesAnterior,
                    lte: ultimoDiaMesAnterior
                }
            },
            _sum: {
                valor: true
            }
        });

        // Faturas vencidas
        const faturasVencidas = await prisma.faturamento.aggregate({
            where: {
                chave: chave,
                dataVencimento: {
                    lt: new Date()
                },
                dataPagamento: null
            },
            _sum: {
                valor: true
            }
        });

        const quantidadeFaturasVencidas = await prisma.faturamento.count({
            where: {
                chave: chave,
                dataVencimento: {
                    lt: new Date()
                },
                dataPagamento: null
            }
        });

        // Evolução financeira dos últimos 6 meses
        const evolucaoFinanceira = [];
        for (let i = 5; i >= 0; i--) {
            const data = new Date();
            data.setMonth(data.getMonth() - i);
            const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);
            const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0);

            const receitas = await prisma.lancamento.aggregate({
                where: {
                    chave: chave,
                    natureza: "receita",
                    data: {
                        gte: primeiroDia,
                        lte: ultimoDia
                    }
                },
                _sum: {
                    valor: true
                }
            });

            const despesas = await prisma.lancamento.aggregate({
                where: {
                    chave: chave,
                    natureza: "despesa",
                    data: {
                        gte: primeiroDia,
                        lte: ultimoDia
                    }
                },
                _sum: {
                    valor: true
                }
            });

            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            
            evolucaoFinanceira.push({
                month: `${meses[data.getMonth()]}/${data.getFullYear()}`,
                receitas: parseFloat(receitas._sum.valor?.toString() || "0"),
                despesas: parseFloat(despesas._sum.valor?.toString() || "0")
            });
        }

        // Categorias de despesas do mês atual
        const categoriasDespesas = await prisma.lancamento.groupBy({
            by: ['categoriaId'],
            where: {
                chave: chave,
                natureza: "despesa",
                data: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                    lte: new Date()
                }
            },
            _sum: {
                valor: true
            },
            orderBy: {
                _sum: {
                    valor: 'desc'
                }
            }
        });

        // Buscar nomes das categorias
        const categoriasComNomes = await Promise.all(
            categoriasDespesas.map(async (item) => {
                const categoria = await prisma.categoria.findUnique({
                    where: { id: item.categoriaId }
                });
                return {
                    categoria: categoria?.descricao || 'Sem categoria',
                    valor: parseFloat(item._sum.valor?.toString() || "0")
                };
            })
        );

        // Status das faturas
        const faturasTotal = await prisma.faturamento.count({
            where: { chave: chave }
        });

        const faturasPagas = await prisma.faturamento.aggregate({
            where: {
                chave: chave,
                dataPagamento: {
                    not: null
                }
            },
            _sum: {
                valor: true
            },
            _count: true
        });

        const faturasPendentes = await prisma.faturamento.aggregate({
            where: {
                chave: chave,
                dataPagamento: null,
                dataVencimento: {
                    gte: new Date()
                }
            },
            _sum: {
                valor: true
            },
            _count: true
        });

        // Métodos de pagamento (simulado com base nas formas de pagamento dos contratos)
        const metodosPagamento = await prisma.faturamento.groupBy({
            by: ['formaPagamentoId'],
            where: {
                chave: chave,
                dataPagamento: {
                    not: null
                }
            },
            _count: {
                formaPagamentoId: true
            }
        });

        const metodosPagamentoComNomes = await Promise.all(
            metodosPagamento.map(async (item) => {
                const formaPagamento = await prisma.formaPagamento.findUnique({
                    where: { id: item.formaPagamentoId! }
                });
                return {
                    metodo: formaPagamento?.formaPagamento || 'Não informado',
                    quantidade: item._count.formaPagamentoId
                };
            })
        );

        // Calcular percentuais para métodos de pagamento
        const totalMetodos = metodosPagamentoComNomes.reduce((acc, item) => acc + item.quantidade, 0);
        const metodosPagamentoComPercentual = metodosPagamentoComNomes.map(item => ({
            ...item,
            percentual: totalMetodos > 0 ? parseFloat(((item.quantidade / totalMetodos) * 100).toFixed(1)) : 0
        }));

        // Calcular percentuais de crescimento
        const receitaAtual = parseFloat(receitaMes._sum.valor?.toString() || "0");
        const receitaAnterior = parseFloat(receitaMesAnterior._sum.valor?.toString() || "0");
        const despesaAtual = parseFloat(despesaMes._sum.valor?.toString() || "0");
        const despesaAnterior = parseFloat(despesaMesAnterior._sum.valor?.toString() || "0");

        const percentualReceitaCrescimento = receitaAnterior > 0 
            ? parseFloat((((receitaAtual - receitaAnterior) / receitaAnterior) * 100).toFixed(1))
            : 0;

        const percentualDespesaCrescimento = despesaAnterior > 0 
            ? parseFloat((((despesaAtual - despesaAnterior) / despesaAnterior) * 100).toFixed(1))
            : 0;

        res.status(200).json({
            resumo: {
                receitaMes: receitaAtual,
                despesaMes: despesaAtual,
                lucroMes: receitaAtual - despesaAtual,
                faturasVencidas: parseFloat(faturasVencidas._sum.valor?.toString() || "0"),
                percentualReceitaCrescimento,
                percentualDespesaCrescimento,
                quantidadeFaturasVencidas
            },
            evolucaoFinanceira,
            categoriasDespesas: categoriasComNomes.slice(0, 5), // Top 5 categorias
            statusFaturas: [
                {
                    status: "Pagas",
                    valor: parseFloat(faturasPagas._sum.valor?.toString() || "0"),
                    quantidade: faturasPagas._count
                },
                {
                    status: "Pendentes", 
                    valor: parseFloat(faturasPendentes._sum.valor?.toString() || "0"),
                    quantidade: faturasPendentes._count
                },
                {
                    status: "Vencidas",
                    valor: parseFloat(faturasVencidas._sum.valor?.toString() || "0"),
                    quantidade: quantidadeFaturasVencidas
                }
            ],
            metodosPagamento: metodosPagamentoComPercentual
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

export default router;