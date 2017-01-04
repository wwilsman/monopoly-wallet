function joinClassNames(classNames) {
  if (Array.isArray(classNames)) {
    classNames = classNames
      .filter(Boolean)
      .map(joinClassNames)
      .join(' ')
  }

  return typeof (classNames === 'string') ? classNames : ''
}

export default joinClassNames
