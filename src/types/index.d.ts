import { UserDocument } from "../../models/User";

declare namespace Express {
    export type User = {
      userId: number;
      userName: string;
      isAdmin: boolean;
    };
  } 