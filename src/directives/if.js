const {bind, analyzeExpression, directive} = window.Slim

directive(
  (attr) => attr.nodeName === 's:if',
  (source, target, attr) => {
    const {paths, method, executions, expression} = analyzeExpression(attr.nodeValue)
    const range = document.createRange()
    const hook = document.createComment('s:if ' + expression.slice(2, -2))
    range.setStartBefore(target, 0)
    range.insertNode(hook)
    range.setStartAfter(hook)
    if (method) {
      paths.forEach(path => {
        bind(source, target, path, () => {
          let result
          try {
            result = executions[0].call(source)
          } catch (e) {
            result = executions[1].call(source)
          }
          if (result) {
            range.setStartBefore(hook)
            range.insertNode(target)
          } else {
            target.remove()
          }
        })
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