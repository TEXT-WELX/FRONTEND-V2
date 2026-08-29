import { useMemo, useRef, useState } from 'react'
import { Code, Download, Play, Save } from 'lucide-react'
import { awardWelxPoints, contentFingerprint } from '../utils/welxPoints'

const starterCodeByLanguage = {
  javascript: `// Welcome to Wel.X Coding Playground
console.log('Hello, World!');

// Try changing "Learner" to your own name
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('Learner'));`,
  python: `print('Hello, World!')

def greet(name):
    return f'Hello, {name}!'

print(greet('aisha'))`,
  java: `public class TestJava {
  public static void main(String[] args) {
    int a = 10;
    int b = 20;

    int sum = a + b;

    if (sum == 30) {
      System.out.println("Java is running correctly!");
    } else {
      System.out.println("Something is wrong.");
    }
  }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  return 0;
}`,
  html: `<!DOCTYPE html>
<html>

  <head>
    <title>My First Webpage</title>
  </head>

  <body>
    <h1>My First Webpage</h1>
    <p>This is a paragraph.</p>
  </body>

</html>`,
}

const languages = [
  { id: 'javascript', name: 'JavaScript', icon: 'JS' },
  { id: 'python', name: 'Python', icon: 'PY' },
  { id: 'java', name: 'Java', icon: 'JV' },
  { id: 'cpp', name: 'C++', icon: 'C+' },
  { id: 'html', name: 'HTML/CSS', icon: '<>' },
]

const examples = [
  { title: 'Calculator App', lang: 'javascript', label: 'JavaScript', difficulty: 'Easy' },
  { title: 'Todo List', lang: 'javascript', label: 'JavaScript', difficulty: 'Medium' },
  { title: 'Data Structures', lang: 'python', label: 'Python', difficulty: 'Hard' },
  { title: 'Web Scraper', lang: 'python', label: 'Python', difficulty: 'Medium' },
]

const comingSoonLanguages = new Set(['python', 'cpp'])

const htmlVoidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

function getFriendlyJavaScriptError(error) {
  const message = error?.message || 'Unknown error'

  if (message.includes('Unexpected end of input')) {
    return 'Syntax Error: Something is not closed. Check for a missing }, ), ], quote, or backtick.'
  }

  if (message.includes('Invalid or unexpected token')) {
    return 'Syntax Error: JavaScript found an invalid symbol. Check your quotes, brackets, and punctuation.'
  }

  if (message.includes('Unexpected token')) {
    return `Syntax Error: JavaScript found something unexpected.\nDetails: ${message}`
  }

  if (message.includes('is not defined')) {
    return `Reference Error: A variable or function name is misspelled or has not been created.\nDetails: ${message}`
  }

  if (message.includes('is not a function')) {
    return `Type Error: Something is being called like a function, but JavaScript cannot run it that way.\nDetails: ${message}`
  }

  return `Error: ${message}`
}

function getLineLabel(index) {
  return `line ${index + 1}`
}

function hasUnclosedQuotes(line) {
  let single = 0
  let double = 0
  let backtick = 0
  let escaped = false

  for (const char of line) {
    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === "'") single += 1
    if (char === '"') double += 1
    if (char === '`') backtick += 1
  }

  return single % 2 !== 0 || double % 2 !== 0 || backtick % 2 !== 0
}

function shouldRequireSemicolon(line) {
  if (!line || line.startsWith('//')) return false
  if (/^(if|else|for|while|switch|try|catch|finally|function|class)\b/.test(line)) return false
  if (/^(import|export)\b/.test(line)) return false
  if (/[;{}:,]$/.test(line)) return false
  if (line.endsWith('(') || line.endsWith('[')) return false
  if (/^\s*<\/?[\w-]/.test(line)) return false

  return /^(const|let|var|return|console\.|[\w$.]+\(|[\w$]+\s*=)/.test(line)
}

function checkJavaScriptBeforeRun(code) {
  const lines = code.split('\n')
  let braces = 0
  let parentheses = 0
  let brackets = 0

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const line = rawLine.trim()

    if (!line || line.startsWith('//')) continue

    if (/\bconsol\.log\b|\bconsole\.(loog|lg)\b/.test(line)) {
      return `Spelling Error on ${getLineLabel(index)}: did you mean "console.log(...)"?`
    }

    if (/\bpritn\s*\(|\bprnt\s*\(/.test(line)) {
      return `Spelling Error on ${getLineLabel(index)}: did you mean "print" in Python, or "console.log" in JavaScript?`
    }

    if (/\bprint\s*\(/.test(line)) {
      return `Syntax Error on ${getLineLabel(index)}: JavaScript uses console.log(...), not print(...).`
    }

    if (hasUnclosedQuotes(rawLine)) {
      return `Syntax Error on ${getLineLabel(index)}: a quote is not closed.`
    }

    if (shouldRequireSemicolon(line)) {
      return `Syntax Error on ${getLineLabel(index)}: missing semicolon ";".`
    }

    for (const char of rawLine) {
      if (char === '{') braces += 1
      if (char === '}') braces -= 1
      if (char === '(') parentheses += 1
      if (char === ')') parentheses -= 1
      if (char === '[') brackets += 1
      if (char === ']') brackets -= 1

      if (braces < 0) return `Syntax Error on ${getLineLabel(index)}: extra closing curly brace "}".`
      if (parentheses < 0) return `Syntax Error on ${getLineLabel(index)}: extra closing bracket ")".`
      if (brackets < 0) return `Syntax Error on ${getLineLabel(index)}: extra closing square bracket "]".`
    }
  }

  if (braces > 0) return 'Syntax Error: missing closing curly brace "}".'
  if (parentheses > 0) return 'Syntax Error: missing closing bracket ")".'
  if (brackets > 0) return 'Syntax Error: missing closing square bracket "]".'

  return null
}

function getLineNumberFromIndex(code, index) {
  return code.slice(0, index).split('\n').length
}

function checkCssSyntax(css, startingLine = 1) {
  const lines = css.split('\n')
  let openBraces = 0

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = startingLine + index
    const line = lines[index].trim()

    if (!line || line.startsWith('/*') || line.startsWith('*') || line.endsWith('*/')) continue

    if (openBraces === 0 && line.includes(':') && !line.includes('{')) {
      return `CSS Error on line ${lineNumber}: CSS properties must be inside a selector block, like body { color: red; }.`
    }

    if (line.includes('{') && !line.split('{')[0].trim()) {
      return `CSS Error on line ${lineNumber}: missing selector before "{".`
    }

    for (const char of line) {
      if (char === '{') openBraces += 1
      if (char === '}') openBraces -= 1

      if (openBraces < 0) return `CSS Error on line ${lineNumber}: extra closing curly brace "}".`
    }

    if (line.includes('{') || line.includes('}') || line.startsWith('@')) continue

    if (openBraces > 0 && line.includes(':') && !line.endsWith(';')) {
      return `CSS Error on line ${lineNumber}: missing semicolon ";".`
    }

    if (openBraces > 0 && /^[a-z-]+\s+[^:;]+;?$/i.test(line)) {
      return `CSS Error on line ${lineNumber}: missing colon ":" between the property and value.`
    }
  }

  if (openBraces > 0) return 'CSS Error: missing closing curly brace "}".'

  return null
}

function checkCssDeclarations(css, startingLine = 1) {
  const blocks = css.matchAll(/([^{}]+)\{([^{}]*)\}/g)

  for (const block of blocks) {
    const selector = block[1].trim()
    const declarations = block[2]
    const blockLine = startingLine + css.slice(0, block.index).split('\n').length - 1
    const declarationLines = declarations.split('\n')

    if (!selector) return `CSS Error on line ${blockLine}: missing selector before "{".`

    for (let index = 0; index < declarationLines.length; index += 1) {
      const lineNumber = blockLine + index
      const line = declarationLines[index].trim()

      if (!line) continue

      const parts = line.split(';').map((part) => part.trim()).filter(Boolean)

      for (const part of parts) {
        if (!part.includes(':')) return `CSS Error on line ${lineNumber}: missing colon ":" between the property and value.`
      }

      if (line.includes(':') && !line.endsWith(';')) {
        return `CSS Error on line ${lineNumber}: missing semicolon ";".`
      }
    }
  }

  return null
}

function checkHtmlTagDelimiters(code) {
  let insideTag = false
  let quote = ''
  let tagStartLine = 1

  for (let index = 0; index < code.length; index += 1) {
    const char = code[index]

    if (insideTag && quote) {
      if (char === quote && code[index - 1] !== '\\') quote = ''
      continue
    }

    if (insideTag && (char === '"' || char === "'")) {
      quote = char
      continue
    }

    if (char === '<') {
      if (insideTag) return `HTML Error on line ${tagStartLine}: missing closing ">" before starting a new tag.`

      insideTag = true
      tagStartLine = getLineNumberFromIndex(code, index)
      continue
    }

    if (char === '>') {
      if (!insideTag) return `HTML Error on line ${getLineNumberFromIndex(code, index)}: extra ">".`

      insideTag = false
    }
  }

  if (insideTag) return `HTML Error on line ${tagStartLine}: missing closing ">".`

  return null
}

function checkHtmlCssSyntax(code) {
  const trimmedCode = code.trim()

  if (!trimmedCode) return 'HTML Error: write some HTML or CSS before running.'

  const delimiterError = checkHtmlTagDelimiters(code)

  if (delimiterError) return delimiterError

  const styleOpenCount = (code.match(/<style\b[^>]*>/gi) || []).length
  const styleCloseCount = (code.match(/<\/style>/gi) || []).length

  if (styleOpenCount > styleCloseCount) return 'HTML Error: missing closing </style> tag.'
  if (styleCloseCount > styleOpenCount) return 'HTML Error: extra closing </style> tag.'

  const styleBlockRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
  let styleMatch = styleBlockRegex.exec(code)

  while (styleMatch) {
    const styleStartLine = getLineNumberFromIndex(code, styleMatch.index)
    const cssError = checkCssSyntax(styleMatch[1], styleStartLine + 1)
    const cssDeclarationError = checkCssDeclarations(styleMatch[1], styleStartLine + 1)

    if (cssError) return cssError
    if (cssDeclarationError) return cssDeclarationError

    styleMatch = styleBlockRegex.exec(code)
  }

  if (!/<[a-z][\s\S]*>/i.test(code) && code.includes('{')) {
    const cssOnlyError = checkCssSyntax(code)
    const cssOnlyDeclarationError = checkCssDeclarations(code)
    return cssOnlyError || cssOnlyDeclarationError || 'CSS syntax check passed.'
  }

  if (!code.includes('<') || !code.includes('>')) return 'HTML Error: missing HTML tags.'

  const tagStack = []
  const tagRegex = /<\/?([a-zA-Z][\w-]*)(\s[^<>]*)?>/g
  let tagMatch = tagRegex.exec(code)

  while (tagMatch) {
    const fullTag = tagMatch[0]
    const tagName = tagMatch[1].toLowerCase()
    const lineNumber = getLineNumberFromIndex(code, tagMatch.index)
    const isClosingTag = fullTag.startsWith('</')
    const isSelfClosingTag = fullTag.endsWith('/>') || htmlVoidTags.has(tagName)
    const tagAttributes = tagMatch[2] || ''

    if (hasUnclosedQuotes(tagAttributes)) {
      return `HTML Error on line ${lineNumber}: an attribute quote is not closed.`
    }

    if (isClosingTag) {
      const lastOpenTag = tagStack.pop()

      if (!lastOpenTag) return `HTML Error on line ${lineNumber}: extra closing </${tagName}> tag.`
      if (lastOpenTag.tagName !== tagName) {
        return `HTML Error on line ${lineNumber}: expected </${lastOpenTag.tagName}> before </${tagName}>.`
      }
    } else if (!isSelfClosingTag) {
      tagStack.push({ tagName, lineNumber })
    }

    tagMatch = tagRegex.exec(code)
  }

  if (tagStack.length > 0) {
    const lastOpenTag = tagStack.pop()
    return `HTML Error on line ${lastOpenTag.lineNumber}: missing closing </${lastOpenTag.tagName}> tag.`
  }

  return 'HTML/CSS syntax check passed.'
}

function shouldRequireJavaSemicolon(line) {
  if (!line || line.startsWith('//')) return false
  if (/^(public|private|protected)?\s*(class|interface|enum)\b/.test(line)) return false
  if (/^(public|private|protected)?\s*(static\s+)?[\w<>[\]]+\s+\w+\s*\([^)]*\)\s*\{?$/.test(line)) return false
  if (/^(if|else|for|while|switch|try|catch|finally|do)\b/.test(line)) return false
  if (/^\}\s*else\b/.test(line)) return false
  if (/[;{}]$/.test(line)) return false

  return /^(import\b|return\b|System\.out\.|Scanner\b|String\b|int\b|double\b|float\b|boolean\b|char\b|long\b|[\w]+\s*=)/.test(line)
}

function checkJavaBeforeRun(code) {
  const lines = code.split('\n')
  let braces = 0
  let parentheses = 0
  let brackets = 0

  if (!/\bpublic\s+class\s+\w+/.test(code)) {
    return 'Java Error: missing public class, for example public class HelloWorld.'
  }

  if (!/\bpublic\s+static\s+void\s+main\s*\(\s*String\s*(\[\]\s*\w+|\w+\s*\[\])\s*\)/.test(code)) {
    return 'Java Error: missing main method, for example public static void main(String[] args).'
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const line = rawLine.trim()

    if (!line || line.startsWith('//')) continue

    if (line.includes('console.log')) {
      return `Java Error on ${getLineLabel(index)}: use System.out.println(...), not console.log(...).`
    }

    if (/\bSystem\.out\.(printn|prinln|printl)\b/.test(line)) {
      return `Spelling Error on ${getLineLabel(index)}: did you mean System.out.println(...)?`
    }

    if (/^\s*print\s*\(/.test(line)) {
      return `Java Error on ${getLineLabel(index)}: use System.out.println(...), not print(...).`
    }

    if (hasUnclosedQuotes(rawLine)) {
      return `Java Syntax Error on ${getLineLabel(index)}: a quote is not closed.`
    }

    if (shouldRequireJavaSemicolon(line)) {
      return `Java Syntax Error on ${getLineLabel(index)}: missing semicolon ";".`
    }

    for (const char of rawLine) {
      if (char === '{') braces += 1
      if (char === '}') braces -= 1
      if (char === '(') parentheses += 1
      if (char === ')') parentheses -= 1
      if (char === '[') brackets += 1
      if (char === ']') brackets -= 1

      if (braces < 0) return `Java Syntax Error on ${getLineLabel(index)}: extra closing curly brace "}".`
      if (parentheses < 0) return `Java Syntax Error on ${getLineLabel(index)}: extra closing bracket ")".`
      if (brackets < 0) return `Java Syntax Error on ${getLineLabel(index)}: extra closing square bracket "]".`
    }
  }

  if (braces > 0) return 'Java Syntax Error: missing closing curly brace "}".'
  if (parentheses > 0) return 'Java Syntax Error: missing closing bracket ")".'
  if (brackets > 0) return 'Java Syntax Error: missing closing square bracket "]".'

  return null
}

function getJavaMainBody(code) {
  const mainMatch = code.match(/\bpublic\s+static\s+void\s+main\s*\(\s*String\s*(\[\]\s*\w+|\w+\s*\[\])\s*\)/)

  if (!mainMatch) return null

  const mainStart = mainMatch.index + mainMatch[0].length
  const openBraceIndex = code.indexOf('{', mainStart)

  if (openBraceIndex === -1) return null

  let depth = 0

  for (let index = openBraceIndex; index < code.length; index += 1) {
    if (code[index] === '{') depth += 1
    if (code[index] === '}') depth -= 1

    if (depth === 0) return code.slice(openBraceIndex + 1, index)
  }

  return null
}

function getJavaBodyLines(code) {
  const body = getJavaMainBody(code)

  if (!body) return []

  const mainStartLine = getLineNumberFromIndex(code, code.indexOf(body))

  return body
    .replace(/\}\s*else\s+if/g, '}\nelse if')
    .replace(/\}\s*else\s*\{/g, '}\nelse {')
    .split('\n')
    .map((text, index) => ({
      text,
      lineNumber: mainStartLine + index,
    }))
}

function splitJavaExpressionParts(expression) {
  const parts = []
  let current = ''
  let quote = ''
  let escaped = false
  let depth = 0

  for (const char of expression) {
    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === '\\') {
      current += char
      escaped = true
      continue
    }

    if (quote) {
      current += char
      if (char === quote) quote = ''
      continue
    }

    if (char === '"' || char === "'") {
      current += char
      quote = char
      continue
    }

    if (char === '(') depth += 1
    if (char === ')') depth -= 1

    if (char === '+' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) parts.push(current.trim())

  return parts
}

function splitJavaCommaParts(expression) {
  const parts = []
  let current = ''
  let quote = ''
  let escaped = false
  let depth = 0

  for (const char of expression) {
    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === '\\') {
      current += char
      escaped = true
      continue
    }

    if (quote) {
      current += char
      if (char === quote) quote = ''
      continue
    }

    if (char === '"' || char === "'") {
      current += char
      quote = char
      continue
    }

    if (char === '(') depth += 1
    if (char === ')') depth -= 1

    if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) parts.push(current.trim())

  return parts
}

function replaceJavaVariables(expression, variables) {
  let replaced = ''
  let index = 0
  let quote = ''
  let escaped = false

  while (index < expression.length) {
    const char = expression[index]

    if (escaped) {
      replaced += char
      escaped = false
      index += 1
      continue
    }

    if (char === '\\') {
      replaced += char
      escaped = true
      index += 1
      continue
    }

    if (quote) {
      replaced += char
      if (char === quote) quote = ''
      index += 1
      continue
    }

    if (char === '"' || char === "'") {
      replaced += char
      quote = char
      index += 1
      continue
    }

    if (/[a-zA-Z_]/.test(char)) {
      const match = expression.slice(index).match(/^[a-zA-Z_]\w*/)
      const name = match[0]
      const previousChar = expression[index - 1]

      if (['true', 'false', 'Math'].includes(name) || previousChar === '.') {
        replaced += name
      } else if (Object.prototype.hasOwnProperty.call(variables, name)) {
        replaced += JSON.stringify(variables[name])
      } else {
        replaced += name
      }

      index += name.length
      continue
    }

    replaced += char
    index += 1
  }

  return replaced
}

function evaluateJavaMathExpression(expression, variables) {
  const replacedExpression = replaceJavaVariables(expression, variables)
    .replace(/\.length\s*\(\s*\)/g, '.length')
    .replace(/\bCharacter\.isLetter\s*\(([^()]*)\)/g, '__javaIsLetter($1)')
    .replace(/\bCharacter\.isDigit\s*\(([^()]*)\)/g, '__javaIsDigit($1)')

  if (!/^[\d+\-*/% ().,<>=!&|"'a-zA-Z_]+$/.test(replacedExpression)) {
    throw new Error(`cannot understand expression "${expression}"`)
  }

  try {
    return Function(
      '__javaIsLetter',
      '__javaIsDigit',
      `"use strict"; return (${replacedExpression})`,
    )(
      (value) => /^[A-Za-z]$/.test(String(value)),
      (value) => /^[0-9]$/.test(String(value)),
    )
  } catch {
    throw new Error(`cannot solve expression "${expression}"`)
  }
}

function evaluateJavaValue(expression, variables) {
  const value = expression.trim()

  if (/^".*"$/.test(value)) return value.slice(1, -1)
  if (/^'.'$/.test(value)) return value.slice(1, -1)
  if (/^(true|false)$/.test(value)) return value === 'true'
  if (Object.prototype.hasOwnProperty.call(variables, value)) return variables[value]
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)

  return evaluateJavaMathExpression(value, variables)
}

function evaluateJavaPrintExpression(expression, variables) {
  if (!expression.trim()) return ''

  const parts = splitJavaExpressionParts(expression)
  const shouldJoinAsText =
    parts.length > 1 &&
    parts.some((part) => {
      const value = part.trim()

      return (
        /^".*"$/.test(value) ||
        /^'.*'$/.test(value) ||
        (Object.prototype.hasOwnProperty.call(variables, value) && typeof variables[value] === 'string')
      )
    })

  if (!shouldJoinAsText) {
    return String(evaluateJavaValue(expression, variables))
  }

  return parts.map((part) => String(evaluateJavaValue(part, variables))).join('')
}

function evaluateJavaPrintfExpression(expression, variables) {
  const [formatPart, ...valueParts] = splitJavaCommaParts(expression)
  let formatted = String(evaluateJavaValue(formatPart, variables))
  let valueIndex = 0

  formatted = formatted.replace(/%[sdifb]/g, (token) => {
    const value = valueParts[valueIndex] === undefined ? '' : evaluateJavaValue(valueParts[valueIndex], variables)

    valueIndex += 1

    if (token === '%d' || token === '%i') return String(parseInt(value, 10))
    if (token === '%f') return String(Number(value))
    if (token === '%b') return String(Boolean(value))

    return String(value)
  })

  return formatted
}

function getJavaScannerCall(expression) {
  return expression.trim().match(/^(\w+)\.(nextLine|nextInt|nextDouble|nextFloat|nextLong|nextBoolean)\s*\(\s*\)$/)
}

function getScannerInputType(method, declaredType) {
  if (method === 'nextLine') return 'String'
  if (method === 'nextBoolean') return 'boolean'
  if (['nextDouble', 'nextFloat'].includes(method)) return 'double'
  if (['nextInt', 'nextLong'].includes(method)) return 'int'

  return declaredType
}

function parseJavaInput(rawInput, type) {
  const value = rawInput.trim()

  if (type === 'String') return rawInput
  if (type === 'boolean') {
    if (/^(true|false)$/i.test(value)) return value.toLowerCase() === 'true'

    throw new Error('please enter true or false.')
  }

  if (['int', 'long'].includes(type)) {
    if (/^-?\d+$/.test(value)) return Number(value)

    throw new Error('please enter a whole number.')
  }

  if (['double', 'float'].includes(type)) {
    const number = Number(value)

    if (Number.isFinite(number)) return number

    throw new Error('please enter a number.')
  }

  if (type === 'char') {
    if (value.length === 1) return value

    throw new Error('please enter one character.')
  }

  return rawInput
}

function getDefaultJavaValue(type) {
  if (['int', 'long', 'double', 'float'].includes(type)) return 0
  if (type === 'boolean') return false
  if (type === 'char') return ''

  return ''
}

function applyJavaLoopUpdate(updateExpression, variables) {
  const update = updateExpression.trim()
  const incrementMatch = update.match(/^(\w+)\+\+$/)
  const decrementMatch = update.match(/^(\w+)--$/)
  const compoundMatch = update.match(/^(\w+)\s*([+\-*/%])=\s*([\s\S]+)$/)
  const assignmentMatch = update.match(/^(\w+)\s*=\s*([\s\S]+)$/)

  if (incrementMatch) {
    const name = incrementMatch[1]

    if (!Object.prototype.hasOwnProperty.call(variables, name)) {
      throw new Error(`loop variable "${name}" has not been created.`)
    }

    variables[name] = Number(variables[name]) + 1
    return
  }

  if (decrementMatch) {
    const name = decrementMatch[1]

    if (!Object.prototype.hasOwnProperty.call(variables, name)) {
      throw new Error(`loop variable "${name}" has not been created.`)
    }

    variables[name] = Number(variables[name]) - 1
    return
  }

  if (compoundMatch) {
    const [, name, operator, rawValue] = compoundMatch

    if (!Object.prototype.hasOwnProperty.call(variables, name)) {
      throw new Error(`loop variable "${name}" has not been created.`)
    }

    variables[name] = evaluateJavaMathExpression(`${name} ${operator} (${rawValue})`, variables)
    return
  }

  if (assignmentMatch) {
    const [, name, rawValue] = assignmentMatch

    if (!Object.prototype.hasOwnProperty.call(variables, name)) {
      throw new Error(`loop variable "${name}" has not been created.`)
    }

    variables[name] = evaluateJavaValue(rawValue, variables)
    return
  }

  throw new Error(`cannot understand loop update "${updateExpression}"`)
}

function applyJavaVariableUpdate(updateExpression, variables) {
  applyJavaLoopUpdate(updateExpression.replace(/;$/, ''), variables)
}

function setupJavaForLoop(initializer, variables) {
  const declarationMatch = initializer.match(/^(?:int|long|double|float)\s+(\w+)\s*=\s*([\s\S]+)$/)
  const assignmentMatch = initializer.match(/^(\w+)\s*=\s*([\s\S]+)$/)

  if (declarationMatch) {
    const [, name, rawValue] = declarationMatch

    variables[name] = evaluateJavaValue(rawValue, variables)
    return
  }

  if (assignmentMatch) {
    const [, name, rawValue] = assignmentMatch

    variables[name] = evaluateJavaValue(rawValue, variables)
    return
  }

  if (!initializer.trim()) return

  throw new Error(`cannot understand loop start "${initializer}"`)
}

function declareJavaVariables(type, declarations, variables, runtime) {
  for (const declaration of splitJavaCommaParts(declarations)) {
    const declarationMatch = declaration.match(/^(\w+)(?:\s*=\s*([\s\S]+))?$/)

    if (!declarationMatch) {
      throw new Error(`cannot understand variable declaration "${declaration}"`)
    }

    const [, name, rawValue] = declarationMatch

    if (rawValue === undefined) {
      variables[name] = getDefaultJavaValue(type)
      continue
    }

    const scannerCall = getJavaScannerCall(rawValue)
    const inputType = scannerCall ? getScannerInputType(scannerCall[2], type) : type
    const pendingInput = scannerCall ? runtime.inputs[runtime.inputIndex] : undefined

    if (scannerCall && pendingInput === undefined) {
      return { waiting: { name, type: inputType } }
    }

    const value = scannerCall ? parseJavaInput(pendingInput, inputType) : evaluateJavaValue(rawValue, variables)

    if (['int', 'long'].includes(type) && !Number.isInteger(Number(value))) {
      throw new Error(`"${name}" must be a whole number.`)
    }

    if (scannerCall) runtime.inputIndex += 1

    variables[name] = value
  }

  return null
}

function collectJavaBlock(lines, openerIndex) {
  const block = []
  let depth = 0
  let started = false

  for (let index = openerIndex; index < lines.length; index += 1) {
    const rawLine = lines[index].text
    const trimmedLine = rawLine.trim()

    for (const char of rawLine) {
      if (char === '{') {
        depth += 1
        started = true
      }

      if (char === '}') depth -= 1
    }

    if (index > openerIndex) {
      if (depth <= 0 && trimmedLine.startsWith('}')) {
        return { block, closingIndex: index, nextIndex: index + 1 }
      }

      block.push(lines[index])
    }

    if (started && depth === 0) {
      return { block, closingIndex: index, nextIndex: index + 1 }
    }
  }

  return { block, closingIndex: lines.length - 1, nextIndex: lines.length }
}

function getElseBlock(lines, closingIndex, nextIndex) {
  const closingLine = lines[closingIndex]?.text.trim() || ''
  const nextLine = lines[nextIndex]?.text.trim() || ''

  if (/^\}\s*else\s+if\s*\(/.test(closingLine)) {
    const result = collectJavaBlock(lines, closingIndex)

    return {
      block: [{ ...lines[closingIndex], text: closingLine.replace(/^\}\s*else\s+/, 'if ') }, ...result.block],
      nextIndex: result.nextIndex,
    }
  }

  if (/^else\s+if\s*\(/.test(nextLine)) {
    const result = collectJavaBlock(lines, nextIndex)

    return {
      block: [{ ...lines[nextIndex], text: nextLine.replace(/^else\s+/, '') }, ...result.block],
      nextIndex: result.nextIndex,
    }
  }

  if (/^\}\s*else\s*\{?\s*$/.test(closingLine)) {
    const result = collectJavaBlock(lines, closingIndex)
    return { block: result.block, nextIndex: result.nextIndex }
  }

  if (/^else\s*\{?\s*$/.test(nextLine)) {
    const result = collectJavaBlock(lines, nextIndex)
    return { block: result.block, nextIndex: result.nextIndex }
  }

  return { block: [], nextIndex }
}

function executeJavaLines(lines, variables, outputLines, runtime) {
  let index = 0

  while (index < lines.length) {
    const item = lines[index]
    const line = item.text.trim()

    if (!line || line.startsWith('//') || line === '{' || line === '}') {
      index += 1
      continue
    }

    if (/^Scanner\s+\w+\s*=\s*new\s+Scanner\s*\(\s*System\.in\s*\)\s*;/.test(line)) {
      index += 1
      continue
    }

    if (/^\w+\.close\s*\(\s*\)\s*;?$/.test(line)) {
      index += 1
      continue
    }

    const ifMatch = line.match(/^if\s*\(([\s\S]+)\)\s*\{?$/)

    if (ifMatch) {
      const trueBlockResult = collectJavaBlock(lines, index)
      const falseBlockResult = getElseBlock(lines, trueBlockResult.closingIndex, trueBlockResult.nextIndex)
      const conditionPassed = Boolean(evaluateJavaMathExpression(ifMatch[1], variables))

      const blockResult = executeJavaLines(
        conditionPassed ? trueBlockResult.block : falseBlockResult.block,
        variables,
        outputLines,
        runtime,
      )

      if (blockResult?.waiting || blockResult?.returned) return blockResult

      index = falseBlockResult.nextIndex
      continue
    }

    if (/^else\b/.test(line) || /^\}\s*else\b/.test(line)) {
      index += 1
      continue
    }

    if (/^return\s*;?$/.test(line)) {
      return { returned: true }
    }

    const forMatch = line.match(/^for\s*\(([\s\S]*?);([\s\S]*?);([\s\S]*?)\)\s*\{?$/)

    if (forMatch) {
      const [, initializer, condition, updateExpression] = forMatch
      const loopBlockResult = collectJavaBlock(lines, index)
      const loopVariables = variables
      let loopCount = 0

      setupJavaForLoop(initializer, loopVariables)

      while (Boolean(evaluateJavaMathExpression(condition || 'true', loopVariables))) {
        const blockResult = executeJavaLines(loopBlockResult.block, loopVariables, outputLines, runtime)

        if (blockResult?.waiting || blockResult?.returned) return blockResult

        applyJavaLoopUpdate(updateExpression, loopVariables)
        loopCount += 1

        if (loopCount > 1000) {
          throw new Error(`line ${item.lineNumber}: loop stopped after 1000 runs to prevent an infinite loop.`)
        }
      }

      index = loopBlockResult.nextIndex
      continue
    }

    const whileMatch = line.match(/^while\s*\(([\s\S]+)\)\s*\{?$/)

    if (whileMatch) {
      const loopBlockResult = collectJavaBlock(lines, index)
      let loopCount = 0

      while (Boolean(evaluateJavaMathExpression(whileMatch[1], variables))) {
        const blockResult = executeJavaLines(loopBlockResult.block, variables, outputLines, runtime)

        if (blockResult?.waiting || blockResult?.returned) return blockResult

        loopCount += 1

        if (loopCount > 1000) {
          throw new Error(`line ${item.lineNumber}: loop stopped after 1000 runs to prevent an infinite loop.`)
        }
      }

      index = loopBlockResult.nextIndex
      continue
    }

    const variableDeclarationMatch = line.match(/^(String|int|double|float|boolean|char|long)\s+([\s\S]+);$/)

    if (variableDeclarationMatch) {
      const [, type, declarations] = variableDeclarationMatch
      const result = declareJavaVariables(type, declarations, variables, runtime)

      if (result?.waiting) return result

      index += 1
      continue
    }

    const declarationMatch = line.match(/^(String|int|double|float|boolean|char|long)\s+(\w+)\s*=\s*([\s\S]+);$/)

    if (declarationMatch) {
      const [, type, name, rawValue] = declarationMatch
      const scannerCall = getJavaScannerCall(rawValue)
      const inputType = scannerCall ? getScannerInputType(scannerCall[2], type) : type
      const pendingInput = scannerCall ? runtime.inputs[runtime.inputIndex] : undefined
      const value = scannerCall
        ? pendingInput === undefined
          ? undefined
          : parseJavaInput(pendingInput, inputType)
        : evaluateJavaValue(rawValue, variables)

      if (scannerCall && pendingInput === undefined) {
        return { waiting: { name, type: inputType } }
      }

      if (['int', 'long'].includes(type) && !Number.isInteger(Number(value))) {
        throw new Error(`line ${item.lineNumber}: "${name}" must be a whole number.`)
      }

      if (scannerCall) runtime.inputIndex += 1

      variables[name] = value
      index += 1
      continue
    }

    const emptyDeclarationMatch = line.match(/^(String|int|double|float|boolean|char|long)\s+(\w+)\s*;$/)

    if (emptyDeclarationMatch) {
      const [, type, name] = emptyDeclarationMatch

      variables[name] = getDefaultJavaValue(type)
      index += 1
      continue
    }

    const updateMatch = line.match(/^(\w+)(?:\+\+|--|(?:\s*[+\-*/%]=\s*[\s\S]+));$/)

    if (updateMatch) {
      applyJavaVariableUpdate(line, variables)
      index += 1
      continue
    }

    const assignmentMatch = line.match(/^(\w+)\s*=\s*([\s\S]+);$/)

    if (assignmentMatch) {
      const [, name, rawValue] = assignmentMatch
      const scannerCall = getJavaScannerCall(rawValue)

      if (!Object.prototype.hasOwnProperty.call(variables, name)) {
        throw new Error(`line ${item.lineNumber}: variable "${name}" has not been created.`)
      }

      if (scannerCall) {
        const currentValue = variables[name]
        const currentType = Number.isInteger(currentValue)
          ? 'int'
          : typeof currentValue === 'number'
            ? 'double'
            : typeof currentValue === 'boolean'
              ? 'boolean'
              : 'String'
        const inputType = getScannerInputType(scannerCall[2], currentType)
        const pendingInput = runtime.inputs[runtime.inputIndex]

        if (pendingInput === undefined) {
          return { waiting: { name, type: inputType } }
        }

        variables[name] = parseJavaInput(pendingInput, inputType)
        runtime.inputIndex += 1
      } else {
        variables[name] = evaluateJavaValue(rawValue, variables)
      }

      index += 1
      continue
    }

    const printfMatch = line.match(/^System\.out\.printf\s*\(([\s\S]*)\)\s*;$/)

    if (printfMatch) {
      outputLines.push(evaluateJavaPrintfExpression(printfMatch[1], variables))
      index += 1
      continue
    }

    const printMatch = line.match(/^System\.out\.print(?:ln)?\s*\(([\s\S]*)\)\s*;$/)

    if (printMatch) {
      outputLines.push(evaluateJavaPrintExpression(printMatch[1], variables))
      index += 1
      continue
    }

    if (/^switch\b/.test(line)) {
      throw new Error(`line ${item.lineNumber}: switch statements are not supported in this browser playground yet. Try if/else for now.`)
    }

    throw new Error(`line ${item.lineNumber}: this Java statement is not supported yet.`)
  }
}

function getJavaStatements(code) {
  return getJavaBodyLines(code)
}

function continueJavaProgram(session) {
  const outputLines = ['Output:']
  const variables = {}
  const runtime = {
    inputIndex: 0,
    inputs: session.inputs || [],
  }

  try {
    const result = executeJavaLines(session.statements, variables, outputLines, runtime)

    if (result?.waiting) {
      outputLines.push(`Waiting for ${result.waiting.name} (${result.waiting.type})...`)

      return {
        ...session,
        variables,
        lines: outputLines,
        waiting: result.waiting,
        completed: false,
        inputError: '',
      }
    }
  } catch (error) {
    return {
      ...session,
      lines: [`Java Runtime Error: ${error.message}`],
      waiting: null,
      completed: true,
      inputError: '',
    }
  }

  if (outputLines.length === 1) {
    outputLines.push('Java syntax check passed, but nothing was printed.')
  }

  return {
    ...session,
    variables,
    lines: outputLines,
    waiting: null,
    completed: true,
    inputError: '',
  }
}

function checkOtherLanguage(code, selectedLanguage) {
  if (selectedLanguage === 'python') {
    if (code.includes('console.log')) return 'Python Error: use print(...), not console.log(...).'
    if (code.includes('{') || code.includes('}')) return 'Python Error: Python uses indentation instead of curly braces.'
    if (/^\s*(def|if|for|while|class)\b(?!.*:\s*$)/m.test(code)) {
      return 'Python Syntax Error: a def/if/for/while/class line needs a colon ":".'
    }
    return 'Python syntax check passed. Real Python execution needs a backend runner.'
  }

  if (selectedLanguage === 'cpp') {
    if (!code.includes('#include')) return 'C++ Error: missing #include statement.'
    if (!code.includes('main')) return 'C++ Error: missing main() function.'
    if (code.includes('console.log')) return 'C++ Error: use cout, not console.log(...).'
    return 'C++ syntax check passed. Real C++ execution needs a backend compiler.'
  }

  return 'Language check is not available yet.'
}

export default function Playground() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [code, setCode] = useState(starterCodeByLanguage.javascript)
  const [output, setOutput] = useState('Run your code to see the output here...')
  const [outputType, setOutputType] = useState('text')
  const [javaSession, setJavaSession] = useState(null)
  const [terminalInput, setTerminalInput] = useState('')
  const [cursorVisible, setCursorVisible] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 })
  const lineNumbersRef = useRef(null)

  const lineNumbers = useMemo(() => {
    const lineCount = code.split('\n').length

    return Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')
  }, [code])

  const fileExtension = useMemo(() => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
    }

    return extensions[selectedLanguage] || 'txt'
  }, [selectedLanguage])

  const selectLanguage = (languageId) => {
    setSelectedLanguage(languageId)
    setCode(starterCodeByLanguage[languageId])
    setOutput(
      comingSoonLanguages.has(languageId)
        ? `${languages.find((language) => language.id === languageId)?.name} sandbox is coming soon. We are preparing a smoother compiler experience for this language.`
        : 'Run your code to see the output here...',
    )
    setOutputType('text')
    setJavaSession(null)
    setTerminalInput('')

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = 0
    }
  }

  const syncLineNumberScroll = (event) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop
    }
  }

  const handlePlaygroundMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })

    setCursorVisible(true)
  }

  const handlePlaygroundMouseLeave = () => {
    setCursorVisible(false)
  }

  const runCode = () => {
    setOutputType('text')
    setJavaSession(null)
    setTerminalInput('')

    if (comingSoonLanguages.has(selectedLanguage)) {
      setOutput(
        `${languages.find((language) => language.id === selectedLanguage)?.name} sandbox is coming soon.\n\nThis compiler is being prepared for Wel.X learners and will be available here soon.`,
      )
      return
    }

    if (selectedLanguage === 'html') {
      const htmlCssError = checkHtmlCssSyntax(code)

      if (htmlCssError.includes('Error')) {
        setOutput(htmlCssError)
        return
      }

      setOutput(code)
      setOutputType('html')
      return
    }

    if (selectedLanguage === 'java') {
      const javaError = checkJavaBeforeRun(code)

      if (javaError) {
        setOutput(javaError)
        return
      }

      const session = continueJavaProgram({
        statements: getJavaStatements(code),
        inputs: [],
        variables: {},
        lines: ['Output:'],
        waiting: null,
        completed: false,
      })

      setJavaSession(session)
      setOutput(session.lines.join('\n'))
      return
    }

    if (selectedLanguage !== 'javascript') {
      setOutput(checkOtherLanguage(code, selectedLanguage))
      return
    }

    const preRunError = checkJavaScriptBeforeRun(code)

    if (preRunError) {
      setOutput(preRunError)
      return
    }

    const logs = []
    const originalLog = console.log

    try {
      console.log = (...args) => {
        logs.push(args.map(String).join(' '))
      }

      new Function(code)()

      setOutput(
        logs.length
          ? `Output:\n${logs.join('\n')}`
          : 'Code executed successfully, but nothing was printed.',
      )
    } catch (error) {
      setOutput(getFriendlyJavaScriptError(error))
    } finally {
      console.log = originalLog
    }
  }

  const submitJavaTerminalInput = (event) => {
    event.preventDefault()

    if (!javaSession?.waiting) return

    try {
      parseJavaInput(terminalInput, javaSession.waiting.type)
    } catch (error) {
      setJavaSession({
        ...javaSession,
        inputError: error.message,
      })
      return
    }

    const session = continueJavaProgram({
      ...javaSession,
      inputs: [...(javaSession.inputs || []), terminalInput],
      inputError: '',
    })

    setJavaSession(session)
    setOutput(session.lines.join('\n'))
    setTerminalInput('')
  }

  const saveCode = async () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')

    if (user.id) {
      try {
        const result = await awardWelxPoints('coding_project_saved', `code:${language}:${contentFingerprint(code)}`, { language })
        alert(result.awarded ? `Project saved · +${result.awarded} WELX points · ${result.points} total` : `Project saved · points for this version were already collected`)
      } catch (error) {
        alert(error?.response?.data?.message || 'Code saved, but points could not be synced.')
      }
      return
    }

    alert('Code saved to your account!')
  }

  const downloadCode = () => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })

    element.href = URL.createObjectURL(file)
    element.download = `code.${fileExtension}`

    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    URL.revokeObjectURL(element.href)
  }

  return (
    <main
      className="playground"
      onMouseMove={handlePlaygroundMouseMove}
      onMouseLeave={handlePlaygroundMouseLeave}
      style={{
        '--cursor-x': `${cursorPosition.x}px`,
        '--cursor-y': `${cursorPosition.y}px`,
      }}
    >
      <div
        className={cursorVisible ? 'playground-cursor visible' : 'playground-cursor'}
        aria-hidden="true"
      />

      <section className="page-title">
        <p className="brand-kicker">
          <Code size={18} aria-hidden="true" />
          Wel.X Code Playground
        </p>
        <h1>Coding Playground</h1>
        <p>Write, test, and experiment with code in real-time</p>
      </section>

      <section className="workspace">
        <aside className="panel language-panel">
          <h2>Languages</h2>

          <div className="language-list">
            {languages.map((language) => (
              <button
                type="button"
                key={language.id}
                onClick={() => selectLanguage(language.id)}
                className={selectedLanguage === language.id ? 'language active' : 'language'}
              >
                <span aria-hidden="true">{language.icon}</span>
                {language.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="editor-column">
          {comingSoonLanguages.has(selectedLanguage) ? (
            <div className="panel coming-soon-panel">
              <span className="coming-soon-badge">Coming Soon</span>
              <h2>{languages.find((language) => language.id === selectedLanguage)?.name} Compiler</h2>
              <p>
                This sandbox is being prepared for Wel.X learners. JavaScript, Java, and HTML/CSS are ready
                to use now, and this language will join them soon.
              </p>
            </div>
          ) : (
            <>
              <div className="panel editor-panel">
                <div className="panel-toolbar">
                  <h2>
                    <Code size={20} aria-hidden="true" />
                    Code Editor
                  </h2>

                  <div className="actions">
                    <button type="button" onClick={runCode} className="primary-action">
                      <Play size={16} aria-hidden="true" />
                      Run
                    </button>

                    <button type="button" onClick={saveCode} className="secondary-action">
                      <Save size={16} aria-hidden="true" />
                      Save (+40 WelX)
                    </button>

                    <button type="button" onClick={downloadCode} className="secondary-action">
                      <Download size={16} aria-hidden="true" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="code-editor-shell">
                  <pre ref={lineNumbersRef} className="line-numbers" aria-hidden="true">
                    {lineNumbers}
                  </pre>
                  <textarea
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    onScroll={syncLineNumberScroll}
                    spellCheck="false"
                    className="code-editor"
                    aria-label={`${selectedLanguage} code editor`}
                    placeholder="Write your code here..."
                  />
                </div>
              </div>

              <div className="panel output-panel">
                <h2>Output</h2>
                {outputType === 'html' ? (
                  <iframe
                    title="HTML/CSS output preview"
                    className="html-preview"
                    sandbox=""
                    srcDoc={output}
                  />
                ) : (
                  <div className={output.includes('Error') ? 'output error' : 'output'}>
                    <pre>{output}</pre>
                    {javaSession?.waiting && (
                      <form className="terminal-form" onSubmit={submitJavaTerminalInput}>
                        <span aria-hidden="true">&gt;</span>
                        <input
                          value={terminalInput}
                          onChange={(event) => setTerminalInput(event.target.value)}
                          className="terminal-input"
                          aria-label={`Enter Java ${javaSession.waiting.name}`}
                          inputMode={javaSession.waiting.type === 'String' ? 'text' : 'numeric'}
                          pattern={javaSession.waiting.type === 'String' ? undefined : '[0-9.-]*'}
                          autoFocus
                        />
                        <button type="submit">Enter</button>
                      </form>
                    )}
                    {javaSession?.inputError && <p className="terminal-error">{javaSession.inputError}</p>}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="panel examples-panel">
            <h2>Example Projects</h2>

            <div className="examples-grid">
              {examples.map((project) => (
                <button
                  type="button"
                  key={project.title}
                  className="example-card"
                  onClick={() => selectLanguage(project.lang)}
                >
                  <strong>{project.title}</strong>
                  <span>
                    {project.label} - {project.difficulty}
                  </span>
                </button>
              ))}
            </div>

            <div className="points-callout">
              <h3>Earn WelX Points</h3>

              <ul>
                <li>Save a project: +40 WelX points</li>
                <li>Share your code: +20 WelX points</li>
                <li>Complete a coding challenge: +30 WelX points</li>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
