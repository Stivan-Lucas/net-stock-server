import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { TransportTargetOptions } from 'pino'
import { env, isDev } from '../config/env/env'

const logDirPath = join(process.cwd(), 'logs')

if (!isDev && !existsSync(logDirPath)) {
  mkdirSync(logDirPath, { recursive: true })
}

const targets: TransportTargetOptions[] = [
  {
    target: 'pino-pretty',
    level: env.LOG_LEVEL,
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'HH:MM:ss',
    },
  },
]

if (!isDev) {
  for (const level of env.LOG_LEVELS_FILES) {
    const unit = env.LOG_ROTATION_INTERVAL.slice(-1).toLowerCase()
    const frequency = unit === 'd' ? 'daily' : 'hourly'

    targets.push({
      target: 'pino-roll',
      level: level,
      options: {
        file: join(logDirPath, `server-${level}.log`),
        frequency,
        limit: { count: env.LOG_KEEP_COUNT },
        size: env.LOG_ROTATION_SIZE,
        mkdir: true,
        extension: '.log',
      },
    })
  }
}

export const loggerConfig = {
  targets,
}
