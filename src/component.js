// @ts-check

import { analyzeExpression } from './utils/domtree.js'
import { buildComponent, shouldAutoCreate } from './utils/buildComponent.js'
import { bind } from './utils/bind.js'
import { directive } from './utils/directives.js'

const dashToCamel = dash => dash.indexOf('-') < 0 ? dash : dash.replace(/-[a-z]/g,
  m => m[1].toUpperCase())

/**
 *
 * @param {typeof Object} Base
 * @constructor
 */
const Component = Base => class extends Base {
  constructor () {
    super()
    if (!this.hasOwnProperty('useShadow')) {
      this.useShadow = true
    }
    this.beforeCreated()
    if (shouldAutoCreate(this)) {
      buildComponent(this)
      requestAnimationFrame(() => {
        this.created()
      })
    }
  }

  static get template () { return null }

  /** @abstract */
  beforeCreated () {}

  /** @abstract */
  created () {}
}

export const Slim = Component(HTMLElement)

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
