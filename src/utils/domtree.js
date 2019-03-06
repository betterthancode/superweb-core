import { directivesFor } from './directives.js'

/**
 *
 * @param {Text} textNode
 * @param {string} expression
 * @returns {Text|null}
 */
export const splitNode = (textNode, expression) => {
  const len = expression.length
  const idx = textNode.nodeValue.indexOf(expression)
  if (idx >= 0) {
    const rest = textNode.splitText(idx)
    rest.nodeValue = rest.nodeValue.slice(len)
    const newNode = document.createTextNode('')
    rest.parentElement.insertBefore(newNode, rest)
    return newNode
  }
}

/**
 *
 * @param {string} expression
 * @returns {{expression: *, method: boolean, paths: Array}}
 */
export const analyzeExpression = (expression) => {
  const matches = expression.match(/\{\{([^\}\}]+)+\}\}/g)
  const resolution = {
    paths: [],
    method: false,
    expression: matches ? matches[0] : null,
    executions: null
  }
  if (matches) {
    const { expression } = resolution
    const rxM = /(?<method>.+)(\((?<args>.+)\)){1}/.exec(expression)
    if (rxM && rxM.groups) {
      resolution.method = rxM.groups.method
      resolution.paths = rxM.groups.args
        .split('this.').join('')
        .split(',').map(x => x.trim())
      resolution.executions = [
        new Function('return ' + expression.slice(2, -2) + ';'),
        new Function('with (this) { return ' + expression.slice(2, -2) + '}')
      ]
    } else {
      resolution.paths = [expression.slice(2, -2).trim()]
    }
  }
  return resolution
}

/**
 *
 * @param {object|HTMLElement|Slim} source
 * @param {Element} target
 * @param {Function} binder
 * @param {Set<Function>} directives
 */
export const scanAttributes = (source, target, binder, directives) => {
  const attrs = Array.from(target.attributes)
  attrs.forEach(attr => {
    const directives = directivesFor(attr)
    if (directives.length) {
      directives.forEach(directive => {
        if (directive.match) {
          directive.execution(source, target, attr, directive.match)
          if (directive.options.hide) {
            requestAnimationFrame(() => {
              attr.ownerElement.removeAttribute(attr.nodeName)
            })
          }
        }
      })
      return
    }
    const { method, paths, executions } = analyzeExpression(attr.nodeValue)
    if (method) {
      paths.forEach(path => {
        binder(source, attr, path, () => {
          try {
            attr.nodeValue = executions[0].call(source)
          } catch {
            attr.nodeValue = executions[1].call(source)
          }
        })
      })
    } else {
      binder(source, attr, paths[0], (s, t, value) => {
        attr.nodeValue = value
      })
    }
  })
}

/**
 *
 * @param {object|HTMLElement} source
 * @param {HTMLElement} target
 * @param {Function} binder
 */
export const scanNode = (source, target, binder) => {

  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT)
  let currentNode = walker.nextNode()
  while (currentNode) {
    const { expression, method, paths, executions } = analyzeExpression(currentNode.nodeValue)
    if (expression) {
      const replacementNode = splitNode(/** @type Text */ currentNode, expression)
      if (method) {
        paths.forEach(path => {
          binder(source, replacementNode, path, () => {
            try {
              replacementNode.nodeValue = executions[0].call(source)
            } catch {
              replacementNode.nodeValue = executions[1].call(source)
            }
          })
        })
      } else {
        const path = paths[0]
        binder(source, replacementNode, path, (source, target, newValue) => {
          replacementNode.nodeValue = newValue
        })
      }
    }
    currentNode = walker.nextNode()
  }
}