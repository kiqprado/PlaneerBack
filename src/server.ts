import 'dotenv/config';
import fastify from 'fastify'
import cors from '@fastify/cors'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'

import { env } from './env'

import { createTrip } from './routes/create-trip'
import { confirmTrip } from './routes/confirm-trip'
import { updateTrip } from './routes/update-trip'
import { getTripDetails } from './routes/get-trip-details'

import { confirmParticipants } from './routes/confirm-participant'
import { getParticipants } from './routes/get-participants'
import { getParticipant } from './routes/get-participant'

import { createActivity } from './routes/create-activity'
import { getActivities } from './routes/get-activities'

import { createLink } from './routes/create-link'
import { getLinks } from './routes/get-links'

import { createInvite } from './routes/create-invite'

import { errorHandler } from './error-handler'


const app = fastify()

app.register(cors, {
  origin: true
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(createTrip)
app.register(confirmTrip)
app.register(updateTrip)
app.register(getTripDetails)
app.register(confirmParticipants)
app.register(getParticipants)
app.register(getParticipant)
app.register(createInvite)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)

app.listen({
  port: env.PORT
}).then(() => {
  console.log('Server running.')
})