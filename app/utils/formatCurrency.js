function formatCurrency(n) {
  return n.toFixed().replace(/(\d)(?=(\d{3})+$)/g, '$1,')
}

export default formatCurrency
