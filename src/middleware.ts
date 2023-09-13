import { StandaloneServerContextFunctionArgument } from '@apollo/server/dist/esm/standalone';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

import { omega_token_secret } from './types';

export async function VerifyToken(req: StandaloneServerContextFunctionArgument['req'], db: PrismaClient) {
  const token = req.headers.authorization;
  if (!token) return null;

  const decoded = verify(token, omega_token_secret);

  switch (typeof decoded) {
    case 'string':
      return null;
    case 'object':
      return await db.user.findUnique({ where: { id: decoded.sub } });
    default:
      return null;
  }
}
