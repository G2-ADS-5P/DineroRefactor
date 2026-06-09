import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Min } from "class-validator";

export class ActivatePlanDto {
  @ApiPropertyOptional({ example: 30, description: "Duração do plano em dias" })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;
}
