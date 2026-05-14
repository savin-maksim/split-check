import { normalizeDecimalInput } from '@shared/lib'

export function calculateExpressionInInput(expression: string): number {
  let cleanExpression = normalizeDecimalInput(expression).replace(/\s+/g, '')

  const mulDivRegex = /(-?\d+(?:\.\d+)?)\s*([*/])\s*(-?\d+(?:\.\d+)?)/
  const addSubRegex = /(-?\d+(?:\.\d+)?)\s*([+-])\s*(-?\d+(?:\.\d+)?)/

  let match: RegExpExecArray | null

  while ((match = mulDivRegex.exec(cleanExpression)) !== null) {
    const full = match[0]
    const leftStr = match[1]
    const operator = match[2]
    const rightStr = match[3]

    if (leftStr === undefined || operator === undefined || rightStr === undefined) {
      break
    }

    const left = parseFloat(leftStr)
    const right = parseFloat(rightStr)

    const result = operator === '*' ? left * right : left / right
    cleanExpression = cleanExpression.replace(full, result.toString())
  }

  while ((match = addSubRegex.exec(cleanExpression)) !== null) {
    const full = match[0]
    const leftStr = match[1]
    const operator = match[2]
    const rightStr = match[3]

    if (leftStr === undefined || operator === undefined || rightStr === undefined) {
      break
    }

    const left = parseFloat(leftStr)
    const right = parseFloat(rightStr)

    const result = operator === '+' ? left + right : left - right
    cleanExpression = cleanExpression.replace(full, result.toString())
  }

  const finalResult = parseFloat(cleanExpression)

  return Number.isNaN(finalResult) || !Number.isFinite(finalResult) ? 0 : finalResult
}
