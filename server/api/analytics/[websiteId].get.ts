import { Prisma, PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireUserSession } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const querySchema = z.object({
    websiteId: z.string().uuid(),
    start: z.string().datetime(),
    end: z.string().datetime(),
  })

  const query = getQuery(event)

  const { websiteId, start, end } = querySchema.parse(query)

  const session = await requireUserSession(event)

  const website = await prisma.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
  })

  if (!website) {
    throw createError({ statusCode: 404, statusMessage: 'Website not found' })
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  const dateFilter = {
    gte: startDate,
    lte: endDate,
  }

  const [totalViews, uniqueVisitors, topPages, topReferrers, pageViewsTrend] = await prisma.$transaction([
    // Total Page Views
    prisma.event.count({
      where: {
        websiteId,
        type: 'pageview',
        createdAt: dateFilter,
      },
    }),

    // Unique Visitors
    prisma.event.groupBy({
      by: ['sessionId'],
      where: {
        websiteId,
        type: 'pageview',
        createdAt: dateFilter,
      },
    }).then(result => result.length),

    // Top Pages
    prisma.event.groupBy({
      by: ['pathname'],
      _count: {
        pathname: true,
      },
      where: {
        websiteId,
        type: 'pageview',
        createdAt: dateFilter,
      },
      orderBy: {
        _count: {
          pathname: 'desc',
        },
      },
      take: 10,
    }),

    // Top Referrers
    prisma.event.groupBy({
      by: ['referrer'],
      _count: {
        referrer: true,
      },
      where: {
        websiteId,
        type: 'pageview',
        referrer: {
          not: ''
        },
        createdAt: dateFilter,
      },
      orderBy: {
        _count: {
          referrer: 'desc',
        },
      },
      take: 10,
    }),

    // Page Views Trend
    prisma.$queryRaw(
      Prisma.sql`
        SELECT
          strftime('%%Y-%%m-%%d', "createdAt" / 1000, 'unixepoch') as date,
          CAST(COUNT(*) AS INTEGER) as views
        FROM "Event"
        WHERE
          "websiteId" = ${websiteId} AND
          "type" = 'pageview' AND
          "createdAt" >= ${dateFilter.gte} AND
          "createdAt" <= ${dateFilter.lte}
        GROUP BY date
        ORDER BY date ASC
      `
    )
  ])

  const formattedTopPages = topPages.map(p => ({
    page: p.pathname,
    views: p._count.pathname ?? 0,
  }))

  const formattedTopReferrers = topReferrers.map(r => ({
    referrer: r.referrer,
    views: r._count.referrer ?? 0,
  }))

  return {
    totalViews,
    uniqueVisitors,
    topPages: formattedTopPages,
    topReferrers: formattedTopReferrers,
    pageViewsTrend,
  }
})
