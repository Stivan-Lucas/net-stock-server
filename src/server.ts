import { app } from './app'

const port: number = 3333
const host: string = '0.0.0.0'

const start = async () => {
  try {
    await app.ready()
    await app.listen({ port, host })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
