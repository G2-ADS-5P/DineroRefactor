import { Account, AccountType } from "@openfinance/domain/models/account.entity";
import {
  BankStatementTransaction,
  BankTransactionType,
} from "@openfinance/domain/models/bank-statement-transaction.entity";
import { Card, type CardBrand } from "@openfinance/domain/models/card.entity";
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from "@openfinance/domain/repositories/account-repository.interface";
import {
  BANK_STATEMENT_TRANSACTION_REPOSITORY,
  type BankStatementTransactionRepository,
} from "@openfinance/domain/repositories/bank-statement-transaction-repository.interface";
import {
  CARD_REPOSITORY,
  type CardRepository,
} from "@openfinance/domain/repositories/card-repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

const DEBIT_DESCRIPTIONS: { description: string; category: string }[] = [
  { description: "Compra débito - Supermercado Extra", category: "Alimentação" },
  { description: "Compra débito - Posto Shell", category: "Transporte" },
  { description: "PIX enviado - João Silva", category: "Transferência" },
  { description: "Pagamento boleto - Conta de luz", category: "Moradia" },
  { description: "Compra débito - Farmácia Drogasil", category: "Saúde" },
  { description: "Compra débito - iFood", category: "Alimentação" },
  { description: "TED enviada - Maria Souza", category: "Transferência" },
  { description: "Pagamento boleto - Internet Vivo", category: "Moradia" },
  { description: "Compra débito - Shopee", category: "Compras" },
  { description: "Saque ATM", category: "Saque" },
  { description: "Compra débito - Posto BR", category: "Transporte" },
  { description: "Pagamento fatura cartão", category: "Cartão de crédito" },
  { description: "Compra débito - Americanas", category: "Compras" },
  { description: "Uber", category: "Transporte" },
  { description: "Pagamento boleto - Condomínio", category: "Moradia" },
];

const CREDIT_DESCRIPTIONS: { description: string; category: string }[] = [
  { description: "PIX recebido - Empresa Ltda", category: "Salário" },
  { description: "Salário - Depósito em conta", category: "Salário" },
  { description: "PIX recebido - Lucas Oliveira", category: "Transferência" },
  { description: "TED recebida - Reembolso despesas", category: "Reembolso" },
  { description: "Rendimento poupança", category: "Rendimento" },
  { description: "Estorno - Supermercado Extra", category: "Estorno" },
];

const CARD_BRANDS: CardBrand[] = ["Visa", "Mastercard", "Elo", "Hipercard"];
const DUE_DAYS = ["5", "10", "15", "20", "25"];

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function randomDigits(count: number): string {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join("");
}

@Injectable()
export class SandboxDataService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    @Inject(BANK_STATEMENT_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: BankStatementTransactionRepository,
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: CardRepository,
  ) {}

  async generateForConnection(bankConnectionId: string): Promise<void> {
    const accounts = await this.generateAccounts(bankConnectionId);
    await this.generateTransactions(accounts);
    await this.generateCards(bankConnectionId);
  }

  private async generateAccounts(bankConnectionId: string): Promise<Account[]> {
    const checkingBalance = randomBetween(500, 15000);
    const savingsBalance = randomBetween(100, 50000);

    const accounts = [
      Account.restore({
        bankConnectionId,
        externalId: randomUUID(),
        accountType: AccountType.CHECKING,
        accountNumber: `****${randomDigits(4)}`,
        balance: checkingBalance,
        currency: "BRL",
      }),
      Account.restore({
        bankConnectionId,
        externalId: randomUUID(),
        accountType: AccountType.SAVINGS,
        accountNumber: `****${randomDigits(4)}`,
        balance: savingsBalance,
        currency: "BRL",
      }),
    ];

    return this.accountRepository.createMany(accounts);
  }

  private async generateTransactions(accounts: Account[]): Promise<void> {
    for (const account of accounts) {
      if (!account.id) continue;

      const count = Math.floor(Math.random() * 10) + 10; // 10–20 transactions
      const transactions: BankStatementTransaction[] = [];

      for (let i = 0; i < count; i++) {
        const isCredit = Math.random() < 0.25;
        const source = isCredit
          ? randomItem(CREDIT_DESCRIPTIONS)
          : randomItem(DEBIT_DESCRIPTIONS);

        transactions.push(
          BankStatementTransaction.restore({
            accountId: account.id,
            description: source.description,
            amount: randomBetween(10, isCredit ? 5000 : 800),
            type: isCredit ? BankTransactionType.CREDIT : BankTransactionType.DEBIT,
            category: source.category,
            transactionDate: pastDate(Math.floor(Math.random() * 60)),
          }),
        );
      }

      await this.transactionRepository.createMany(transactions);
    }
  }

  private async generateCards(bankConnectionId: string): Promise<void> {
    const cardCount = Math.random() < 0.4 ? 2 : 1;
    const cards: Card[] = [];

    for (let i = 0; i < cardCount; i++) {
      const limit = randomBetween(1000, 15000);
      const bill = randomBetween(0, limit * 0.7);

      cards.push(
        Card.restore({
          bankConnectionId,
          lastFourDigits: randomDigits(4),
          cardBrand: randomItem(CARD_BRANDS),
          cardLimit: limit,
          availableLimit: Math.round((limit - bill) * 100) / 100,
          currentBill: bill,
          dueDay: randomItem(DUE_DAYS),
        }),
      );
    }

    await this.cardRepository.createMany(cards);
  }
}
