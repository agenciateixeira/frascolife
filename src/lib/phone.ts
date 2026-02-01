import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from 'libphonenumber-js'

/**
 * Normaliza telefone para formato E.164
 * @param phone - Número de telefone
 * @param defaultCountry - País padrão (BR)
 * @returns Telefone no formato E.164 ou null se inválido
 */
export function normalizePhone(phone: string, defaultCountry: CountryCode = 'BR'): string | null {
  try {
    // Remove espaços e caracteres especiais
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')

    // Se já está no formato E.164, validar e retornar
    if (cleaned.startsWith('+')) {
      if (isValidPhoneNumber(cleaned)) {
        return parsePhoneNumber(cleaned).number
      }
      return null
    }

    // Se não tem código de país, adicionar o padrão
    const phoneNumber = parsePhoneNumber(cleaned, defaultCountry)

    if (!phoneNumber || !phoneNumber.isValid()) {
      return null
    }

    return phoneNumber.number // Retorna no formato E.164
  } catch (error) {
    console.error('Erro ao normalizar telefone:', error)
    return null
  }
}

/**
 * Formata telefone para exibição
 * @param phone - Telefone no formato E.164
 * @returns Telefone formatado (ex: +55 11 99999-9999)
 */
export function formatPhone(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumber(phone)
    if (!phoneNumber) return phone

    return phoneNumber.formatInternational()
  } catch (error) {
    return phone
  }
}

/**
 * Detecta se o identificador é email ou telefone
 * @param identifier - Email ou telefone
 * @returns 'email' | 'phone' | 'unknown'
 */
export function detectIdentifierType(identifier: string): 'email' | 'phone' | 'unknown' {
  const cleaned = identifier.trim()

  // Verificar se é email (contém @)
  if (cleaned.includes('@')) {
    return 'email'
  }

  // Verificar se é telefone (só números, +, espaços, parênteses)
  const phonePattern = /^[\+\d\s\(\)\-\.]+$/
  if (phonePattern.test(cleaned)) {
    return 'phone'
  }

  return 'unknown'
}

/**
 * Valida telefone
 * @param phone - Número de telefone
 * @returns true se válido
 */
export function isValidPhone(phone: string): boolean {
  try {
    return isValidPhoneNumber(phone)
  } catch {
    return false
  }
}
