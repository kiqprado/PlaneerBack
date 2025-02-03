import fastify from 'fastify'
import cors from '@fastify/cors'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'

import { createTrip } from './routes/create-trip'
import { confirmTrip } from './routes/confirm-trip'
import { confirmParticipants } from './routes/confirm-participant'
import { getParticipants } from './routes/get-participants'
import { createActivity } from './routes/create-activity'
import { getActivities } from './routes/get-activities'
import { createLink } from './routes/create-link'
import { getLinks } from './routes/get-links'
import { createInvite } from './routes/create-invite'
import { updateTrip } from './routes/update-trip'


const app = fastify()

app.register(cors, {
  origin: true
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)
app.register(confirmTrip)
app.register(updateTrip)
app.register(confirmParticipants)
app.register(getParticipants)
app.register(createInvite)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)

app.listen({
  port: 3333
}).then(() => {
  console.log('Server running.')
})