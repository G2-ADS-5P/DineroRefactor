export interface AuthenticatedUser {
  sub: string;
  email: string;
  permissions: string[];
}
