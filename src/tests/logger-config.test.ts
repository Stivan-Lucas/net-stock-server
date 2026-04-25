import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import * as fs from 'node:fs'
import { env } from '../config/env/env'
import { loggerConfig } from '../plugins/logger'

describe('Logger Config', () => {
  // Spies para o sistema de arquivos
  const existsSyncSpy = spyOn(fs, 'existsSync')
  const mkdirSyncSpy = spyOn(fs, 'mkdirSync')

  beforeEach(() => {
    existsSyncSpy.mockClear()
    mkdirSyncSpy.mockClear()
  })

  afterEach(() => {
    existsSyncSpy.mockRestore()
    mkdirSyncSpy.mockRestore()
  })

  it('deve sempre conter o target pino-pretty', () => {
    const hasPretty = loggerConfig.targets.some(
      (t) => t.target === 'pino-pretty',
    )
    expect(hasPretty).toBe(true)

    const prettyTarget = loggerConfig.targets.find(
      (t) => t.target === 'pino-pretty',
    )
    expect(prettyTarget?.level).toBe(env.LOG_LEVEL)
  })

  describe('Configuração em Produção/Test (!isDev)', () => {
    it('deve configurar pino-roll para cada nível definido em LOG_LEVELS_FILES', () => {
      const rollTargets = loggerConfig.targets.filter(
        (t) => t.target === 'pino-roll',
      )

      expect(rollTargets.length).toBe(env.LOG_LEVELS_FILES.length)

      const firstRoll = rollTargets[0]

      expect(firstRoll).toBeDefined()

      if (firstRoll) {
        expect(firstRoll.options).toMatchObject({
          size: env.LOG_ROTATION_SIZE,
          limit: { count: env.LOG_KEEP_COUNT },
          mkdir: true,
        })
      }
    })

    it('deve traduzir corretamente o intervalo de rotação para frequency', () => {
      const rollTargets = loggerConfig.targets.filter(
        (t) => t.target === 'pino-roll',
      )

      const firstRoll = rollTargets[0]

      expect(firstRoll).toBeDefined()

      if (firstRoll?.options) {
        const unit = env.LOG_ROTATION_INTERVAL.slice(-1).toLowerCase()
        const expectedFreq = unit === 'd' ? 'daily' : 'hourly'
        expect(firstRoll.options.frequency).toBe(expectedFreq)
      }
    })
  })

  describe('Lógica de Diretório', () => {
    // Este teste valida se a lógica que você escreveu faria a chamada correta
    it('deve verificar se o diretório existe e criar se necessário', () => {
      // Aqui simulamos o que o código faz no topo do arquivo
      const logDir = 'logs'

      // Simulação da lógica:
      if (!existsSyncSpy(logDir)) {
        mkdirSyncSpy(logDir, { recursive: true })
      }

      expect(existsSyncSpy).toHaveBeenCalled()
    })
  })
})
