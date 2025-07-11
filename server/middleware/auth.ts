import type { Session, User } from 'lucia';
import { lucia } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, lucia.sessionCookieName);
  if (!sessionId) {
    event.context.session = null;
    event.context.user = null;
    return;
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    appendHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize());
  }
  if (!session) {
    appendHeader(event, 'Set-Cookie', lucia.createBlankSessionCookie().serialize());
  }
  event.context.session = session;
  event.context.user = user;
});

declare module 'h3' {
  interface H3EventContext {
    user: User | null;
    session: Session | null;
  }
}
