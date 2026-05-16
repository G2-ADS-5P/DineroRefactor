import { ApiProperty } from "@nestjs/swagger";
import type { User } from "@users/domain/models/user.entity";

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  phone: string | undefined;

  @ApiProperty({ nullable: true })
  birthDate: Date | undefined;

  @ApiProperty({ nullable: true })
  location: string | undefined;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(
    id: string,
    name: string,
    email: string,
    phone: string | undefined,
    birthDate: Date | undefined,
    location: string | undefined,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.birthDate = birthDate;
    this.location = location;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(user: User | null): UserResponseDto | null {
    if (!user) return null;
    return new UserResponseDto(
      user.id!,
      user.name,
      user.email,
      user.phone,
      user.birthDate,
      user.location,
      user.createdAt,
      user.updatedAt,
    );
  }
}
