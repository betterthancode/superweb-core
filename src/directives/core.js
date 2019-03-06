import { directive } from '../utils/directives'
import { analyzeExpression } from '../utils/domtree'
import { bind } from '../utils/bind'

const dashToCamel = dash => dash.indexOf('-') < 0 ? dash : dash.replace(/-[a-z]/g,
  m => m[1].toUpperCase())

directive(
  (attr) => {
    return attr.nodeName.startsWith(':') ? analyzeExpression(attr.nodeValue) : undefined
  },
  (source, target, attr, expressionInfo) => {
    const targetProp = dashToCamel(attr.nodeName.slice(1))
    const { paths, executions } = expressionInfo
    paths.forEach(path => {
      if (executions) {
        bind(source, target, path, (s, t, value) => {
          try {
            target[targetProp] = executions[0].call(source)
          } catch {
            target[targetProp] = executions[1].call(source)
          }
        })
      } else {
        bind(source, target, path, (s, t, value) => {
          target[targetProp] = value
        })
      }
    })
  },
  {
    hide: true
  }
)
