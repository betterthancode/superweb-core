import { scanAttributes, scanNode } from './domtree.js'
import { bind } from './bind.js'

const templateMap = new WeakMap


/**
 *
 * @param {Node} rootNode
 * @returns {Node[]}
 */
const nestedChildNodes = rootNode => {
  const list = []
  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT)
  while (walker.nextNode()) list.push(walker.currentNode)
  return list
}

export const buildComponent = target => {
  const ctor = target.constructor
  /**
   *
   * @type {HTMLTemplateElement|string}
   */
  let template = templateMap.get(ctor)
  if (!template && ctor.template) {
    templateMap.set(ctor, ctor.template)
    template = templateMap.get(ctor)
    if (typeof template === 'string') {
      const node = document.createElement('template')
      node.innerHTML = /** @type string */ template
      template = /** @type HTMLTemplateElement */ node
      templateMap.set(ctor, template)
    }
  }

  if (!template) {
    requestAnimationFrame(() => {
      const children = Array.from(target.childNodes)
      const childElements = nestedChildNodes(target)
      children.forEach(child => scanNode(target, child, bind))
      childElements.forEach(child => scanAttributes(target, child, bind))
    })
  } else {
    const content = template.content.cloneNode(true)
    const children = Array.from(content.childNodes)
    const childElements = nestedChildNodes(content)
    requestAnimationFrame(() => {
      children.forEach(child => scanNode(target, child, bind))
      childElements.forEach(child => scanAttributes(target, child, bind))
      const root = target['useShadow'] === true ? target.shadowRoot || target.attachShadow({ mode: 'open' }) : target
      root.appendChild(content)
    })
  }
}

export const shouldAutoCreate = target => {
  // TODO: Implement this
  return true
}