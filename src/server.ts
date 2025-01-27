import fastify from 'fastify'

const app = fastify()

app.get('/test', () => {
  return 'Hello world!'
})

app.listen({
  port: 3333
}).then(() => {
  console.log('Server running.')
})