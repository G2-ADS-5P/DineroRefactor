export type SandboxInstitution = {
  id: string;
  name: string;
  type: "digital" | "traditional" | "investment";
  primaryColor: string;
  debitDescriptions: { description: string; category: string }[];
  creditDescriptions: { description: string; category: string }[];
  cardBrands: string[];
  checkingBalanceRange: [number, number];
  savingsBalanceRange: [number, number];
  cardLimitRange: [number, number];
};

export const SANDBOX_INSTITUTIONS: SandboxInstitution[] = [
  {
    id: "nubank",
    name: "Nubank",
    type: "digital",
    primaryColor: "#8A05BE",
    checkingBalanceRange: [200, 8000],
    savingsBalanceRange: [0, 2000],
    cardLimitRange: [500, 20000],
    cardBrands: ["Mastercard"],
    debitDescriptions: [
      { description: "Compra no débito - iFood", category: "Alimentação" },
      { description: "Compra no débito - Mercado Livre", category: "Compras" },
      { description: "Compra no débito - 99Food", category: "Alimentação" },
      { description: "PIX enviado - Amigo", category: "Transferência" },
      { description: "Compra no débito - Uber Eats", category: "Alimentação" },
      { description: "Compra no débito - Rappi", category: "Alimentação" },
      { description: "Compra no débito - Netflix", category: "Entretenimento" },
      { description: "Compra no débito - Spotify", category: "Entretenimento" },
      { description: "Compra no débito - Steam", category: "Entretenimento" },
    ],
    creditDescriptions: [
      { description: "PIX recebido", category: "Transferência" },
      { description: "Cashback Nubank", category: "Cashback" },
      { description: "Salário - Depósito", category: "Salário" },
      { description: "Estorno de compra", category: "Estorno" },
    ],
  },
  {
    id: "itau",
    name: "Itaú Unibanco",
    type: "traditional",
    primaryColor: "#EC7000",
    checkingBalanceRange: [500, 25000],
    savingsBalanceRange: [1000, 80000],
    cardLimitRange: [1000, 30000],
    cardBrands: ["Visa", "Mastercard"],
    debitDescriptions: [
      { description: "Compra débito - Supermercado Pão de Açúcar", category: "Alimentação" },
      { description: "Débito automático - Conta de água", category: "Moradia" },
      { description: "Débito automático - Conta de luz ENEL", category: "Moradia" },
      { description: "TED enviada", category: "Transferência" },
      { description: "Compra débito - Posto Ipiranga", category: "Transporte" },
      { description: "Pagamento boleto - Condomínio", category: "Moradia" },
      { description: "Compra débito - Farmácia São Paulo", category: "Saúde" },
      { description: "Saque ATM Itaú", category: "Saque" },
      { description: "Compra débito - Magazine Luiza", category: "Compras" },
      { description: "Pagamento fatura Itaucard", category: "Cartão de crédito" },
    ],
    creditDescriptions: [
      { description: "Salário - Crédito em conta", category: "Salário" },
      { description: "TED recebida", category: "Transferência" },
      { description: "PIX recebido", category: "Transferência" },
      { description: "Rendimento poupança Itaú", category: "Rendimento" },
      { description: "Reembolso de despesas", category: "Reembolso" },
    ],
  },
  {
    id: "bradesco",
    name: "Bradesco",
    type: "traditional",
    primaryColor: "#CC092F",
    checkingBalanceRange: [300, 20000],
    savingsBalanceRange: [500, 60000],
    cardLimitRange: [800, 25000],
    cardBrands: ["Visa", "Elo"],
    debitDescriptions: [
      { description: "Compra débito - Supermercado Extra", category: "Alimentação" },
      { description: "Débito automático - Internet Claro", category: "Moradia" },
      { description: "Pagamento boleto - IPTU", category: "Impostos" },
      { description: "TED enviada - Bradesco", category: "Transferência" },
      { description: "Compra débito - Posto BR", category: "Transporte" },
      { description: "Compra débito - Drogaria Onofre", category: "Saúde" },
      { description: "Saque - Bradesco 24h", category: "Saque" },
      { description: "Compra débito - Renner", category: "Compras" },
    ],
    creditDescriptions: [
      { description: "Crédito de salário", category: "Salário" },
      { description: "TED recebida", category: "Transferência" },
      { description: "PIX recebido - Bradesco", category: "Transferência" },
      { description: "Rendimento poupança", category: "Rendimento" },
    ],
  },
  {
    id: "santander",
    name: "Santander",
    type: "traditional",
    primaryColor: "#EC0000",
    checkingBalanceRange: [400, 18000],
    savingsBalanceRange: [200, 50000],
    cardLimitRange: [1000, 28000],
    cardBrands: ["Mastercard", "Visa"],
    debitDescriptions: [
      { description: "Compra débito - Carrefour", category: "Alimentação" },
      { description: "Débito automático - Plano de saúde Amil", category: "Saúde" },
      { description: "Pagamento boleto - Aluguel", category: "Moradia" },
      { description: "DOC/TED enviado", category: "Transferência" },
      { description: "Compra débito - Shell Select", category: "Transporte" },
      { description: "Compra débito - Centauro", category: "Compras" },
      { description: "Saque Santander", category: "Saque" },
    ],
    creditDescriptions: [
      { description: "Salário - Crédito", category: "Salário" },
      { description: "Transferência recebida", category: "Transferência" },
      { description: "PIX recebido", category: "Transferência" },
      { description: "Juros poupança", category: "Rendimento" },
    ],
  },
  {
    id: "banco-do-brasil",
    name: "Banco do Brasil",
    type: "traditional",
    primaryColor: "#FDCF00",
    checkingBalanceRange: [200, 30000],
    savingsBalanceRange: [1000, 100000],
    cardLimitRange: [500, 20000],
    cardBrands: ["Visa", "Mastercard", "Elo"],
    debitDescriptions: [
      { description: "Compra débito - Mercadinho do Bairro", category: "Alimentação" },
      { description: "Débito automático - Telefone fixo", category: "Moradia" },
      { description: "Pagamento GRU - Governo Federal", category: "Impostos" },
      { description: "TED enviada - BB", category: "Transferência" },
      { description: "Compra débito - Atacadão", category: "Alimentação" },
      { description: "Saque - Banco do Brasil", category: "Saque" },
      { description: "Pagamento boleto - Faculdade", category: "Educação" },
    ],
    creditDescriptions: [
      { description: "Salário - BB Pagamentos", category: "Salário" },
      { description: "Aposentadoria INSS", category: "Benefício" },
      { description: "PIX recebido", category: "Transferência" },
      { description: "Rendimento poupança BB", category: "Rendimento" },
    ],
  },
  {
    id: "caixa",
    name: "Caixa Econômica Federal",
    type: "traditional",
    primaryColor: "#005CA9",
    checkingBalanceRange: [100, 15000],
    savingsBalanceRange: [500, 200000],
    cardLimitRange: [300, 10000],
    cardBrands: ["Visa", "Elo", "Mastercard"],
    debitDescriptions: [
      { description: "Compra débito - Mercado", category: "Alimentação" },
      { description: "Débito automático - Conta de gás", category: "Moradia" },
      { description: "Pagamento boleto - FGTS", category: "Impostos" },
      { description: "Transferência enviada - Caixa", category: "Transferência" },
      { description: "Compra débito - Farmácia Popular", category: "Saúde" },
      { description: "Saque CAIXA", category: "Saque" },
    ],
    creditDescriptions: [
      { description: "Benefício FGTS", category: "Benefício" },
      { description: "Salário - Crédito Caixa", category: "Salário" },
      { description: "PIX recebido", category: "Transferência" },
      { description: "Bolsa Família", category: "Benefício" },
      { description: "Rendimento poupança CAIXA", category: "Rendimento" },
    ],
  },
  {
    id: "inter",
    name: "Banco Inter",
    type: "digital",
    primaryColor: "#FF7A00",
    checkingBalanceRange: [100, 10000],
    savingsBalanceRange: [0, 15000],
    cardLimitRange: [500, 15000],
    cardBrands: ["Mastercard", "Visa"],
    debitDescriptions: [
      { description: "Compra débito - iFood", category: "Alimentação" },
      { description: "PIX enviado - Inter", category: "Transferência" },
      { description: "Compra débito - Amazon", category: "Compras" },
      { description: "Compra débito - Shopee", category: "Compras" },
      { description: "Compra débito - Netshoes", category: "Compras" },
      { description: "Compra débito - Disney+", category: "Entretenimento" },
    ],
    creditDescriptions: [
      { description: "Salário recebido", category: "Salário" },
      { description: "PIX recebido - Inter", category: "Transferência" },
      { description: "Cashback Inter Shop", category: "Cashback" },
      { description: "Rendimento conta remunerada", category: "Rendimento" },
    ],
  },
];

export function findInstitutionById(id: string): SandboxInstitution | undefined {
  return SANDBOX_INSTITUTIONS.find((i) => i.id === id);
}
