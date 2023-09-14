import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

import { omega_token_secret } from './types';

export async function auth(req, db: PrismaClient) {
  const token = req.headers.authorization;
  if (!token) return null;

  const parsed_token = verify(token, omega_token_secret);

  switch (typeof parsed_token) {
    case 'string':
      return null;
    case 'object':
      return await db.user.findUnique({ where: { id: parsed_token.sub } });
    default:
      return null;
  }
}
