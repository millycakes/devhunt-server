declare module 'express-sslify' {
  import { Request, Response, NextFunction } from 'express';

  interface EnforceOptions {
    trustProtoHeader?: boolean;
    trustAzureHeader?: boolean;
  }

  export function HTTPS(options?: EnforceOptions): (req: Request, res: Response, next: NextFunction) => void;
}