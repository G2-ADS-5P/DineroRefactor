import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";
import { CreateTransactionDto } from "@transactions/application/dto/create-transaction.dto";
import { TransactionResponseDto } from "@transactions/application/dto/transaction-response.dto";
import { UpdateTransactionDto } from "@transactions/application/dto/update-transaction.dto";
import { TransactionService } from "@transactions/application/services/transaction.service";

@ApiTags("transactions")
@ApiBearerAuth()
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: "Listar transações" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<TransactionResponseDto>({
    basePath: "/v1/transactions",
    itemLinks: (item) => ({
      self: { href: `/v1/transactions/${item.id}`, method: "GET" },
      update: { href: `/v1/transactions/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/transactions/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.transactionService.listPaginated(user.sub, { page, limit });
  }

  @Post()
  @ApiOperation({ summary: "Criar transação" })
  @HateoasItem<TransactionResponseDto>({
    basePath: "/v1/transactions",
    itemLinks: (item) => ({
      self: { href: `/v1/transactions/${item.id}`, method: "GET" },
      update: { href: `/v1/transactions/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/transactions/${item.id}`, method: "DELETE" },
      list: { href: "/v1/transactions", method: "GET" },
    }),
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateTransactionDto,
  ) {
    return this.transactionService.create(user.sub, body);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalhar transação" })
  @ApiNotFoundResponse({ description: "Transação não encontrada" })
  @HateoasItem<TransactionResponseDto>({
    basePath: "/v1/transactions",
    itemLinks: (item) => ({
      self: { href: `/v1/transactions/${item.id}`, method: "GET" },
      update: { href: `/v1/transactions/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/transactions/${item.id}`, method: "DELETE" },
      list: { href: "/v1/transactions", method: "GET" },
    }),
  })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.transactionService.findById(user.sub, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar transação" })
  @ApiNotFoundResponse({ description: "Transação não encontrada" })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.transactionService.update(user.sub, id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft delete de transação" })
  @ApiNoContentResponse({ description: "Transação removida (soft delete)" })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.transactionService.remove(user.sub, id);
  }
}
