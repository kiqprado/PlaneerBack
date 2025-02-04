import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from 'zod'
import { env } from '../env'

import nodemailer from 'nodemailer'

import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'
import { getMailClient } from "../lib/mail";

import { ClientError } from "../errors/client-error";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", {
    schema: {
      params: z.object({
        tripId: z.string().uuid()
      })
    }
  }, async (req, reply) => {
    const { tripId } = req.params

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      },
      include: {
        participants: {
          where: {
            is_owner: false
          }
        }
      }
    })

    if(!trip) {
      throw new ClientError('Trip not found.')
    }
  
    if(trip.is_confirmed) {
      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    }

    await prisma.trip.update({
      where: { id: tripId },
      data: { is_confirmed: true },
    })

    const formattedStartDate = dayjs(trip.starts_at).format('LL')
    const formattedEndDate = dayjs(trip.ends_at).format('LL')
   
    const mail = await getMailClient()

    await Promise.all(
      trip.participants.map(async (participant) => {

        const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

        const message = await mail.sendMail({
          from: {
            name: 'Equipe Plann.Er',
            address: 'team@Plann.er.com'
          },
          to: participant.email,
          subject: `Confirme a sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
          html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Você recebeu um convite a participar de uma viagem para <strong>${trip.destination}</strong> nas datas <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
              <p></p>
              <p>Para confirmar sua presença, clique no link abaixo:</p>
              <p></p>
              <a href="${confirmationLink}">Confirmar presença na viagem</a>
              <p></p>
              <p>Caso esteja usando o dispositivo móvel, você também pode confirmar a criação da viagem pelos aplicativos:</p>
              <p></p>
              <a href="">Aplicativo para Iphone</a>
              <a href="">Aplicativo para Android</a>
              <p></p>
              <p>Caso você não saiba do que se trata esse e-mail ou não poderá comparecer nas datas em questão, apenas ignore este e-mail.</p>
            </div>
              `.trim()
            })
        
            console.log(nodemailer.getTestMessageUrl(message))
      })
    )

    return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
  })
}