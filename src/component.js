// @ts-check

import { buildComponent, shouldAutoCreate } from './utils/buildComponent.js'
import { directive } from './utils/directives.js'
import { bind } from './utils/bind'
import './directives/core.js'
import { analyzeExpression } from './utils/domtree'

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
Slim.directive = directive
Slim.bind = bind
Slim.analyzeExpression = analyzeExpression


window.Slim = Slim