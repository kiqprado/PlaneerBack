import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import dayjs from 'dayjs'

import { prisma } from '../lib/prisma'

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date()
      })
    }
  }, async (req) => {
    const { destination, starts_at, ends_at } = req.body

    if(dayjs(starts_at).isBefore(new Date())) {
      throw new Error ("Invalid Trip starts date.")
    }

    if(dayjs(ends_at).isBefore(starts_at)) {
      throw new Error ("Invalid Trip ends date.")
    }

    const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at
      }
    })
    
    return {
      tripId: trip.id
    }

  })
}