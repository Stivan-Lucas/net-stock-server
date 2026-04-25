export const PINO_LEVELS = [
  'trace',
  'debug',
  'info',
  'notice',
  'warn',
  'error',
  'critical',
  'alert',
  'emergency',
  'fatal',
  'all',
  'off',
] as const

export type PinoLevel = (typeof PINO_LEVELS)[number]
