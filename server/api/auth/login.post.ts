import { PrismaClient } from '@prisma/client';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';
import { lucia } from '~/server/utils/auth';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
    });
  }

  const { email, password } = parsedBody.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email or password',
    });
  }

  const validPassword = await new Argon2id().verify(user.password, password);

  if (!validPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email or password',
    });
  }

  const session = await lucia.createSession(user.id, {});
  appendHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize());

  return { user: { id: user.id, email: user.email } };
});
