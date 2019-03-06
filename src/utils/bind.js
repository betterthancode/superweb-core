import {watch, unwatch} from 'oculusx'

export const bind = (source, target, expression, execution) => {
  const invocation = (/** @type {*} */ value, /** @type string */ key) => {
    execution(source, target, value, expression, key)
  }
  watch(source, expression, invocation, true)
  invocation.unbind = () => unwatch(source, expression, invocation)
  return invocation.unbind
}