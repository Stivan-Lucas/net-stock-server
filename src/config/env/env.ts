import z from 'zod'
import { PINO_LEVELS, type PinoLevel } from '../../constants/logs'
import { LOG_INTERVAL_REGEX, LOG_SIZE_REGEX } from '../../regex/logs'

const envSchema = z.object({
  // Server Config
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    message: 'NODE_ENV deve ser: development, production ou test',
  }),
  PORT: z.coerce
    .number()
    .int('PORT deve ser um número inteiro')
    .positive('PORT deve ser um número positivo'),
  HOST: z
    .string()
    .min(1, 'HOST é obrigatório e deve ter pelo menos 1 caractere'),

  // LOGS Config
  LOG_LEVEL: z.enum(PINO_LEVELS, {
    message: `LOG_LEVEL inválido. Use um dos níveis: ${PINO_LEVELS.join(', ')}`,
  }),

  LOG_LEVELS_FILES: z
    .string()
    .min(1, 'LOG_LEVELS_FILES deve conter ao menos um nível (ex: info,error)')
    .transform((val): PinoLevel[] => {
      const levels = val
        .split(',')
        .map((v) => v.trim().toLowerCase())
        .filter((v) => v !== '')

      for (const level of levels) {
        if (!PINO_LEVELS.includes(level as PinoLevel)) {
          throw new Error(
            `Nível de log inválido no array de arquivos: ${level}`,
          )
        }
      }
      return levels as PinoLevel[]
    }),

  LOG_ROTATION_SIZE: z
    .string()
    .regex(
      LOG_SIZE_REGEX,
      'LOG_ROTATION_SIZE inválido. Use formato como: 10m, 100k, 1g',
    ),
  LOG_ROTATION_INTERVAL: z
    .string()
    .regex(
      LOG_INTERVAL_REGEX,
      'LOG_ROTATION_INTERVAL inválido. Use formato como: 1d, 12h',
    ),
  LOG_KEEP_COUNT: z.coerce
    .number()
    .int('LOG_KEEP_COUNT deve ser um número inteiro')
    .positive('LOG_KEEP_COUNT deve ser maior que zero'),
})

const _env = envSchema.safeParse(Bun.env)

if (!_env.success) {
  console.error('❌ Erro de validação das variáveis de ambiente:')
  const tree = z.treeifyError(_env.error)
  console.error(tree)
  process.exit(1)
}

export const env = _env.data
export const isDev = env.NODE_ENV !== 'production'
export const isTest = env.NODE_ENV === 'test'
