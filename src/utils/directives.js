const directives = new Set
let directivesArr = []

/**
 * @typedef DirectiveExecutionContext
 * @property {HTMLElement} source
 * @property {HTMLElement} target
 * @property {*} matchResult
 */

/**
 * @typedef {function(Attr): *} DirectiveMatcher
 */

/**
 * @typedef {function(ctx: DirectiveExecutionContext): void} DirectiveExecution
 */

/**
 *
 * @param {DirectiveMatcher} matcher
 * @param {DirectiveExecution} executor
 * @param {object} [options]
 */
export const directive = (matcher, executor, options = {}) => {
  directives.add(matcher)
  directivesArr = Array.from(directives)
  matcher.execution = executor
  matcher.options = options
}

/**
 * @param {Attr} attr
 * @returns {object[]}
 */
export const directivesFor = (attr) => {
  return directivesArr.reduce((all, matcher) => {
    const match = matcher(attr)
    if (match) {
      all.push({
        match,
        matcher,
        execution: matcher.execution,
        options: matcher.options
      })
    }
    return all
  }, [])
}