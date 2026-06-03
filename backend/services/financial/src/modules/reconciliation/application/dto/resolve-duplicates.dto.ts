import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class ResolveDuplicatesDto {
  @ApiProperty({
    type: [String],
    description: "IDs a manter (não serão deletados)",
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  keepIds!: string[];

  @ApiProperty({ type: [String], description: "IDs a remover via soft delete" })
  @IsArray()
  @IsUUID(undefined, { each: true })
  deleteIds!: string[];
}
