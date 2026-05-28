import { CardService } from "@cards/application/services/card.service";
import { CARD_REPOSITORY } from "@cards/domain/repositories/card-repository.interface";
import { CardsController } from "@cards/infra/controllers/cards.controller";
import { DrizzleCardRepository } from "@cards/infra/repositories/drizzle-card.repository";
import { Module } from "@nestjs/common";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [CardsController],
  providers: [
    CardService,
    DrizzleCardRepository,
    { provide: CARD_REPOSITORY, useExisting: DrizzleCardRepository },
  ],
  exports: [CardService],
})
export class CardsModule {}
