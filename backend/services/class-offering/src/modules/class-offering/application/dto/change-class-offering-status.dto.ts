import { ClassOfferingStatus } from "@class-offering/domain/models/class-offering.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";

export class ChangeClassOfferingStatusDto {
  @ApiProperty({ enum: ClassOfferingStatus })
  @IsEnum(ClassOfferingStatus)
  @IsNotEmpty()
  status: ClassOfferingStatus;
}
