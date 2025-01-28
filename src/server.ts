import fastify from 'fastify'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'

import { createTrip } from './routes/create-trip'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)

app.listen({
  port: 3333
}).then(() => {
  console.log('Server running.')
})