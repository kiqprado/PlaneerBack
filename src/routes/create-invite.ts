import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from 'zod'
import { env } from '../env'
import nodemailer from 'nodemailer'

import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'
import { getMailClient } from "../lib/mail"

import { ClientError } from "../errors/client-error";

export async function createInvite(app: FastifyInstance) {
 app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', {
  schema: {
    params: z.object({
      tripId: z.string().uuid()
    }),
    body: z.object({
      email: z.string().email()
    })
  }
 }, async (req) => {
  const { tripId } = req.params
  const { email } = req.body

  const trip = await prisma.trip.findUnique({
    where: { id: tripId }
  })

  if(!trip) {
    throw new ClientError("Trip not found.")
  }

  const participant =  await prisma.participant.create({
    data: {
      email,
      trip_id: tripId
    }
  })

  const formattedStartDate = dayjs(trip.starts_at).format('LL')
  const formattedEndDate = dayjs(trip.ends_at).format('LL')
     
  const mail = await getMailClient()
  
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

  return { participantId: participant.id }
 })
}