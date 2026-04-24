import { randomUUID } from 'node:crypto'
import Fastify from 'fastify'

export const app = Fastify({
  logger: true,
  genReqId: () => randomUUID(),
})
