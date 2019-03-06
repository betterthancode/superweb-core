const {bind, analyzeExpression, directive} = window.Slim

directive(
  (attr) => attr.nodeName === 's:for',
  /**
   *
   * @param {object|HTMLElement} source
   * @param {HTMLElement} target
   * @param {Attr} attr
   */
  (source, target, attr) => {

    /**
     * @type {Range}
     */
    const range = document.createRange()

    /**
     * @type {Comment}
     */
    const hook = document.createComment('s:for ' + attr.nodeValue)

    /**
     *
     * @type {HTMLTemplateElement}
     */
    const templateElement = /** @type HTMLTemplateElement */ document.createElement('template')

    range.setStartBefore(target, 0)
    range.insertNode(hook)
    range.setStartAfter(hook)
    const {paths, method, executions} = analyzeExpression(attr.nodeValue)
    if (method) {
      paths.forEach(path => {
        bind(source, target, path, (s, t, value) => {
          try {
            value = executions[0]()
          } catch (e) {
            value = executions[1]()
          }
        })
        if (value) {
          range.setStartBefore(hook)
          range.insertNode(target)
        } else {
          target.remove()
        }
      })
    } else if (paths) {
      const prop = paths[0]
      bind(source, target, prop, (s, t, value) => {
        if (value) {
          range.setStartBefore(hook)
          range.insertNode(target)
        } else {
          target.remove()
        }
      })

    }
  },
  {
    hide: true,
    block: true
  })