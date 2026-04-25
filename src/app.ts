import { randomUUID } from 'node:crypto'
import Fastify from 'fastify'
import { loggerConfig } from './plugins/logger'

export const app = Fastify({
  genReqId: () => randomUUID(),
  logger: {
    transport: loggerConfig,
  },
})
