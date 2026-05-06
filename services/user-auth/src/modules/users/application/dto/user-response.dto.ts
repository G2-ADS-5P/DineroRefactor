import { ApiProperty } from "@nestjs/swagger";
import type { User } from "@users/domain/models/user.entity";

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  teacherId: string | undefined;

  @ApiProperty({ nullable: true })
  teacherName: string | undefined;

  @ApiProperty({ isArray: true, type: String })
  permissions: string[];

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(
    id: string,
    email: string,
    teacherId: string | undefined,
    teacherName: string | undefined,
    permissions: string[],
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.email = email;
    this.teacherId = teacherId;
    this.teacherName = teacherName;
    this.permissions = permissions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(user: User | null): UserResponseDto | null {
    if (!user) return null;
    return new UserResponseDto(
      user.id!,
      user.email,
      user.teacherId,
      user.teacherName,
      user.permissions,
      user.createdAt,
      user.updatedAt,
    );
  }
}
