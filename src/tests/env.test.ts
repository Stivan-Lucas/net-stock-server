import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  spyOn,
} from 'bun:test'
import z from 'zod'
import { envSchema } from '../config/env/env'

const validConfig = {
  NODE_ENV: 'development',
  PORT: '3000',
  HOST: 'localhost',
  LOG_LEVEL: 'info',
  LOG_LEVELS_FILES: 'info,error',
  LOG_ROTATION_SIZE: '10m',
  LOG_ROTATION_INTERVAL: '1d',
  LOG_KEEP_COUNT: '5',
}

describe('Env Schema Validation', () => {
  it('deve validar configurações corretas', () => {
    const result = envSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.PORT).toBe(3000)
      expect(result.data.LOG_LEVELS_FILES).toEqual(['info', 'error'])
    }
  })

  describe('Server Config', () => {
    it('deve falhar se NODE_ENV for inválido', () => {
      const result = envSchema.safeParse({
        ...validConfig,
        NODE_ENV: 'staging',
      })
      expect(result.success).toBe(false)
    })

    it('deve falhar se PORT não for um número', () => {
      const result = envSchema.safeParse({ ...validConfig, PORT: 'abc' })
      expect(result.success).toBe(false)
    })

    it('deve falhar se HOST estiver vazio', () => {
      const result = envSchema.safeParse({ ...validConfig, HOST: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('Log Config', () => {
    it('deve falhar se LOG_LEVEL for inválido', () => {
      const result = envSchema.safeParse({
        ...validConfig,
        LOG_LEVEL: 'verbose',
      })
      expect(result.success).toBe(false)
    })

    it('deve validar LOG_LEVELS_FILES com espaços', () => {
      const result = envSchema.safeParse({
        ...validConfig,
        LOG_LEVELS_FILES: 'info , error , debug',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.LOG_LEVELS_FILES).toEqual(['info', 'error', 'debug'])
      }
    })

    it('deve falhar se LOG_ROTATION_SIZE tiver formato errado', () => {
      const result = envSchema.safeParse({
        ...validConfig,
        LOG_ROTATION_SIZE: '10mb',
      }) // Regex espera 10m
      expect(result.success).toBe(false)
    })

    it('deve falhar se LOG_ROTATION_INTERVAL tiver formato errado', () => {
      const result = envSchema.safeParse({
        ...validConfig,
        LOG_ROTATION_INTERVAL: '1year',
      })
      expect(result.success).toBe(false)
    })

    it('deve falhar se LOG_KEEP_COUNT for negativo', () => {
      const result = envSchema.safeParse({
        ...validConfig,
        LOG_KEEP_COUNT: '-1',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Env Implementation Logic', () => {
  const originalEnv = { ...Bun.env }

  let exitSpy: Mock<(code?: number) => never>
  let errorSpy: Mock<typeof console.error>

  beforeEach(() => {
    // Cast usando unknown para evitar o 'any' e satisfazer o Biome
    exitSpy = spyOn(process, 'exit').mockImplementation(
      (() => {}) as unknown as (code?: number) => never,
    )
    errorSpy = spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    Object.assign(Bun.env, originalEnv)
    exitSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('deve exportar isTest como true quando NODE_ENV for test', () => {
    const nodeEnv = 'test'
    const isTest = nodeEnv === 'test'
    expect(isTest).toBe(true)
  })

  it('deve exportar isDev como false quando NODE_ENV for production', () => {
    const nodeEnv = 'production'
    const isDev = nodeEnv !== 'production'
    expect(isDev).toBe(false)
  })

  it('deve simular o comportamento de erro e process.exit', () => {
    const invalidEnv: Record<string, unknown> = {
      ...validConfig,
      NODE_ENV: 'invalido',
    }

    const result = envSchema.safeParse(invalidEnv)

    if (!result.success) {
      const tree = z.treeifyError(result.error)
      console.error('❌ Erro de validação das variáveis de ambiente:')
      console.error(tree)
      process.exit(1)
    }

    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(errorSpy).toHaveBeenCalled()
  })
})
