// @ts-check

import '../node_modules/oculusx/dist/index.js'
import { splitNode, scanNode, scanAttributes } from './utils/text.js'

const { watch, unwatch } = window['oculusx']

/**
 * @typedef {Set<Function>} Binders
 */

/**
 * @typedef {Map<string, Binders>} BindMap
 */

/**
 * @typedef {WeakMap<object, BindMap>} Bindings
 */

/**
 * @type Bindings
 */
const elementBindings = new WeakMap

const getBindingsFor = target => {
  let bindMap = elementBindings.get(target)
  if (!bindMap) {
    bindMap = new Map
    elementBindings.set(target, bindMap)
  }
  return bindMap
}

const getBindingsByExpression = (target, expression) => {
  const bindMap = getBindingsFor(target)
  let set = bindMap.get(expression)
  if (!set) {
    set = new Set
    bindMap.set(expression, set)
  }
  return set
}

/**
 * @param {object|HTMLElement} source
 * @param {object|HTMLElement|Slim} target
 * @param {string} expression
 * @param {Function} execution
 * @interface Binder
 */
const bind = (source, target, expression, execution) => {
  const invocator = (/** @type {*} */ value, /** @type string */ key) => {
    execution(source, target, value, expression.split('.')[0], key)
  }
  watch(source, expression, invocator, true)
  invocator.unbind = () => unwatch(source, expression, invocator)
  getBindingsByExpression(source, expression.split('.')[0]).add(invocator)
  return invocator.unbind
}

/**
 * @param {Slim} target
 */
const shouldAutoCreate = target => {
  // TODO: Implement this
  return true
}

/**
 * @param {Slim} target
 */
const buildComponent = target => {
  // TODO: Build component
  const children = Array.from(target.childNodes)
  const childElements = Array.from(target.children)
  children.forEach(child => scanNode(target, child, bind))
  childElements.forEach(child => scanAttributes(target, child, bind))
}

/**
 * @param {Slim} target
 */
const runBindings = target => {
  const bindings = getBindingsFor(target)
  bindings.forEach(binders => {
    binders.forEach(binder => binder())
  })
}

const runBindingsByExpression = (target, expression) => {
  getBindingsByExpression(target, expression).forEach(binder => binder())
}

const clearBindings = target => {
  getBindingsFor(target).clear()
}

/**
 * @param {typeof HTMLElement} Base
 */
const Component = Base => class extends Base {
  constructor () {
    super()
    // setup bind mapping
    elementBindings.set(this, new Map)
    this.beforeCreated()
    if (shouldAutoCreate(this)) {
      requestAnimationFrame(() => {
        buildComponent(this)
        this.created()
      })
    }
  }

  /** @abstract */
  beforeCreated () {}

  /** @abstract */
  created () {}

  /**
   * @protected
   * @param {string} [expression]
   */
  update (expression) {
    if (expression) {
      runBindingsByExpression(this, expression)
    } else {
      runBindings(this)
    }
  }
}

export const Slim = Component(HTMLElement)

Slim.bind = bind
