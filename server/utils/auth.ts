import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { PrismaClient } from '@prisma/client';
import { Lucia, Session, User } from 'lucia';
import type { H3Event } from 'h3'

const client = new PrismaClient();
const adapter = new PrismaAdapter(client.session, client.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !process.dev,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
    };
  },
});

export const requireUserSession = async (event: H3Event): Promise<{ user: User; session: Session }> => {
    const context = event.context
    if (!context.user || !context.session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }
    return { user: context.user, session: context.session }
}

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
    };
  }
}

declare module 'h3' {
    interface H3EventContext {
        user: User | null
        session: Session | null
    }
}
