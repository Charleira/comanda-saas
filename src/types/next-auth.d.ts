import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      role: "SUPER_ADMIN" | "ADMIN" | "CASHIER" | "OPERATOR";
    } & DefaultSession["user"];
  }
}