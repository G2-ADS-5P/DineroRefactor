import { ApiProperty } from "@nestjs/swagger";
import type {
  PortfolioAccessPlan,
  PortfolioAccessStatus,
} from "@portfolio/domain/models/portfolio-access.entity";

export class PortfolioAccessResponseDto {
  @ApiProperty({ example: "TRIAL", nullable: true })
  plan: PortfolioAccessPlan | null;

  @ApiProperty({ example: "ACTIVE", nullable: true })
  status: PortfolioAccessStatus | null;

  @ApiProperty({ example: true })
  canWrite: boolean;

  @ApiProperty({ example: "2026-05-30T12:00:00.000Z", nullable: true })
  trialEndsAt: string | null;

  @ApiProperty({ example: null, nullable: true })
  planExpiresAt: string | null;

  constructor(props: {
    plan: PortfolioAccessPlan | null;
    status: PortfolioAccessStatus | null;
    canWrite: boolean;
    trialEndsAt: string | null;
    planExpiresAt: string | null;
  }) {
    this.plan = props.plan;
    this.status = props.status;
    this.canWrite = props.canWrite;
    this.trialEndsAt = props.trialEndsAt;
    this.planExpiresAt = props.planExpiresAt;
  }
}
