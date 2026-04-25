/**
 * Valida formatos de tamanho de arquivo (ex: 10k, 5m, 1g)
 */
export const LOG_SIZE_REGEX = /^\d+(k|m|g)$/i

/**
 * Valida intervalos de tempo para rotação (apenas h e d para pino-roll)
 */
export const LOG_INTERVAL_REGEX = /^\d+(h|d)$/i
