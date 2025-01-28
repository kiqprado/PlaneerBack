import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import nodemailer from 'nodemailer';

import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'
import { getMailClient } from "../lib/mail";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.string().email()
      })
    }
  }, async (req) => {
    const { destination, starts_at, ends_at, owner_name, owner_email } = req.body

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

    const formattedStartDate = dayjs(starts_at).format('LL')
    const formattedEndDate = dayjs(ends_at).format('LL')

    const mail = await getMailClient()

    const message = await mail.sendMail({
      from: {
        name: 'Equipe Plann.Er',
        address: 'team@Plann.er.com'
      },
      to: {
        name: owner_name,
        address: owner_email
      },
      subject: 'Confirme a sua viagem para ${destination} em ${formattedStartDate}',
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para confirmar sua viagem, clique no link abaixo:</p>
          <p></p>
          <a href="">Confirmar viagem</a>
          <p></p>
          <p>Caso esteja usando o dispositivo móvel, você também pode confirmar a criação da viagem pelos aplicativos:</p>
          <p></p>
          <a href="">Aplicativo para Iphone</a>
          <a href="">Aplicativo para Android</a>
          <p></p>
          <p>Caso você não saiba do que  se trata esse e-mail, apenas ignore este e-mail.</p>
        </div>
      `.trim()
    })

    console.log(nodemailer.getTestMessageUrl(message))
    
    return {
      tripId: trip.id
    }

  })
}