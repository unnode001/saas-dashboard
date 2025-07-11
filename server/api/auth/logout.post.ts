import { lucia } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  if (!event.context.session) {
    throw createError({
      statusCode: 403,
    });
  }
  await lucia.invalidateSession(event.context.session.id);
  appendHeader(event, 'Set-Cookie', lucia.createBlankSessionCookie().serialize());
  return {
    message: 'Logged out',
  };
});
