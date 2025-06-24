import { PrismaClient } from '@prisma/client';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';
import { lucia } from '~/server/utils/auth';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
    });
  }

  const { email, password } = parsedBody.data;

  const hashedPassword = await new Argon2id().hash(password);

  try {
    const user = await prisma.user.create({
      data: {
        id: Math.random().toString(36).substring(2, 15), // Replace with a better ID generator
        email,
        password: hashedPassword,
      },
    });

    const session = await lucia.createSession(user.id, {});
    appendHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize());

    return { user: { id: user.id, email: user.email } };
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email already in use',
    });
  }
});
