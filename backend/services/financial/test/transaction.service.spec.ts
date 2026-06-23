import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { TransactionService } from "@transactions/application/services/transaction.service";
import { TransactionMessagingService } from "@transactions/application/services/transaction-messaging.service";
import { Transaction } from "@transactions/domain/models/transaction.entity";
import { TRANSACTION_REPOSITORY } from "@transactions/domain/repositories/transaction-repository.interface";
import { UserService } from "@users/application/services/user.service";
import { User } from "@users/domain/models/user.entity";
import { CardService } from "@cards/application/services/card.service";

const LOCAL_USER_ID = "aaaaaaaa-0000-0000-0000-000000000001";
const EXTERNAL_USER_ID = "bbbbbbbb-0000-0000-0000-000000000002";
const TX_ID = "cccccccc-0000-0000-0000-000000000003";
const CARD_ID = "dddddddd-0000-0000-0000-000000000004";

function makeUser(): User {
  return User.restore({
    id: LOCAL_USER_ID,
    externalId: EXTERNAL_USER_ID,
    name: "Test User",
    email: "test@test.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  })!;
}

function makeTransaction(): Transaction {
  return Transaction.restore({
    id: TX_ID,
    userId: LOCAL_USER_ID,
    amount: 2500,
    currency: "BRL",
    type: "income",
    description: "Pagamento mês",
    date: new Date("2026-05-26T00:00:00Z"),
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })!;
}

describe("TransactionService", () => {
  let service: TransactionService;

  const mockRepo = {
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findById: jest.fn(),
    findByIdAndUserId: jest.fn(),
    findByClientUuidAndUserId: jest.fn(),
    findAllByUserId: jest.fn(),
    findAllByUserIdSince: jest.fn(),
    findAllByUserIdForSync: jest.fn(),
    findAllByUserIdPaginated: jest.fn(),
    aggregateBalance: jest.fn(),
  };

  const mockUserService = {
    ensureLocalUser: jest.fn(),
  };

  const mockMessaging = {
    publishTransactionCreated: jest.fn(),
    publishTransactionUpdated: jest.fn(),
    publishTransactionDeleted: jest.fn(),
  };

  const mockCardService = {
    findById: jest.fn(),
    addToCurrentBill: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: TRANSACTION_REPOSITORY, useValue: mockRepo },
        { provide: UserService, useValue: mockUserService },
        { provide: TransactionMessagingService, useValue: mockMessaging },
        { provide: CardService, useValue: mockCardService },
      ],
    }).compile();

    service = module.get(TransactionService);
  });

  describe("create()", () => {
    it("deve criar transação e publicar transaction.created", async () => {
      const tx = makeTransaction();
      mockUserService.ensureLocalUser.mockResolvedValue(makeUser());
      mockRepo.findByClientUuidAndUserId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(undefined);
      mockRepo.findAllByUserIdPaginated.mockResolvedValue({
        rows: [tx],
        total: 1,
      });
      mockMessaging.publishTransactionCreated.mockResolvedValue(undefined);

      const result = await service.create(EXTERNAL_USER_ID, {
        amount: 2500,
        currency: "BRL",
        type: "income",
        description: "Pagamento mês",
        date: "2026-05-26T00:00:00Z",
      });

      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(mockMessaging.publishTransactionCreated).toHaveBeenCalledTimes(1);
      expect(mockMessaging.publishTransactionCreated).toHaveBeenCalledWith(
        expect.objectContaining({ id: TX_ID }),
      );
      expect(result.id).toBe(TX_ID);
    });

    it("deve rejeitar criação em USD sem amountBrl e exchangeRate", async () => {
      await expect(
        service.create(EXTERNAL_USER_ID, {
          amount: 100,
          currency: "USD",
          type: "expense",
          description: "Compra no exterior",
          date: "2026-05-26T00:00:00Z",
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockMessaging.publishTransactionCreated).not.toHaveBeenCalled();
    });

    it("deve vincular a despesa ao cartão e atualizar a fatura", async () => {
      mockUserService.ensureLocalUser.mockResolvedValue(makeUser());
      mockCardService.findById.mockResolvedValue({ id: CARD_ID });
      mockCardService.addToCurrentBill.mockResolvedValue(undefined);
      mockRepo.create.mockResolvedValue(undefined);
      mockRepo.findAllByUserIdPaginated.mockResolvedValue({
        rows: [makeTransaction()],
        total: 1,
      });
      mockMessaging.publishTransactionCreated.mockResolvedValue(undefined);

      await service.create(EXTERNAL_USER_ID, {
        amount: 125.5,
        currency: "BRL",
        type: "expense",
        description: "Supermercado",
        date: "2026-05-26T00:00:00Z",
        cardId: CARD_ID,
      });

      expect(mockCardService.findById).toHaveBeenCalledWith(
        EXTERNAL_USER_ID,
        CARD_ID,
      );
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ cardId: CARD_ID }),
      );
      expect(mockCardService.addToCurrentBill).toHaveBeenCalledWith(
        EXTERNAL_USER_ID,
        CARD_ID,
        125.5,
      );
    });
  });

  describe("update()", () => {
    it("deve atualizar descrição e publicar transaction.updated", async () => {
      const tx = makeTransaction();
      mockUserService.ensureLocalUser.mockResolvedValue(makeUser());
      mockRepo.findByIdAndUserId.mockResolvedValue(tx);
      mockRepo.update.mockResolvedValue(undefined);
      mockMessaging.publishTransactionUpdated.mockResolvedValue(undefined);

      const result = await service.update(EXTERNAL_USER_ID, TX_ID, {
        description: "Nova descrição",
      });

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      expect(mockMessaging.publishTransactionUpdated).toHaveBeenCalledTimes(1);
      expect(mockMessaging.publishTransactionUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ id: TX_ID }),
      );
      expect(result.description).toBe("Nova descrição");
    });
  });

  describe("findById()", () => {
    it("deve lançar NotFoundException quando transação não existir", async () => {
      mockUserService.ensureLocalUser.mockResolvedValue(makeUser());
      mockRepo.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.findById(EXTERNAL_USER_ID, "uuid-inexistente"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove()", () => {
    it("deve fazer soft delete e publicar transaction.deleted", async () => {
      const tx = makeTransaction();
      mockUserService.ensureLocalUser.mockResolvedValue(makeUser());
      mockRepo.findByIdAndUserId.mockResolvedValue(tx);
      mockRepo.softDelete.mockResolvedValue(undefined);
      mockMessaging.publishTransactionDeleted.mockResolvedValue(undefined);

      await service.remove(EXTERNAL_USER_ID, TX_ID);

      expect(mockRepo.softDelete).toHaveBeenCalledTimes(1);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(
        expect.objectContaining({ _deletedAt: expect.any(Date) }),
      );
      expect(mockMessaging.publishTransactionDeleted).toHaveBeenCalledTimes(1);
      expect(mockMessaging.publishTransactionDeleted).toHaveBeenCalledWith(
        expect.objectContaining({ id: TX_ID }),
      );
    });
  });
});
