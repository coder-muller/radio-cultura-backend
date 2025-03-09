-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "razaoSocial" TEXT,
    "nomeFantasia" TEXT,
    "contato" TEXT,
    "cpf" TEXT,
    "cnpj" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "inscMunicipal" TEXT,
    "atividade" TEXT,
    "email" TEXT,
    "fone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "dataEmissao" TIMESTAMP(3),
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "programaId" INTEGER NOT NULL,
    "numInsercoes" INTEGER,
    "valor" DECIMAL(10,2),
    "corretorId" INTEGER,
    "comissao" DOUBLE PRECISION,
    "diaVencimento" INTEGER,
    "formaPagamentoId" INTEGER,
    "status" TEXT,
    "descritivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faturamento" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "programaId" INTEGER NOT NULL,
    "corretoresId" INTEGER,
    "dataEmissao" TIMESTAMP(3),
    "dataVencimento" TIMESTAMP(3),
    "dataPagamento" TIMESTAMP(3),
    "valor" DECIMAL(10,2),
    "formaPagamentoId" INTEGER,
    "descritivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faturamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Corretores" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "email" TEXT,
    "fone" TEXT,
    "dataAdmissao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Corretores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormaPagamento" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "formaPagamento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormaPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programacao" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "programa" TEXT,
    "horaInicio" TEXT,
    "horaFim" TEXT,
    "apresentador" TEXT,
    "diasApresentacao" TEXT,
    "valorPatrocinio" DECIMAL(10,2),
    "estilo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "FormaPagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faturamento" ADD CONSTRAINT "Faturamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faturamento" ADD CONSTRAINT "Faturamento_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faturamento" ADD CONSTRAINT "Faturamento_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "Programacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faturamento" ADD CONSTRAINT "Faturamento_corretoresId_fkey" FOREIGN KEY ("corretoresId") REFERENCES "Corretores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
