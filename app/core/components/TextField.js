import React from 'react'

const TextField = ({ style, ...props }) => {
  let inputStyle = styles.input

  if (!props.value) {
    inputStyle = { ...inputStyle, ...styles.empty }
  }

  return (
    <input style={{ ...inputStyle, ...style }} {...props}/>
  )
}

const styles = {
  input: {
    fontSize: 16,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'white',
    paddingBottom: 10,
    marginBottom: 40
  },
  empty: {
    opacity: 0.6
  }
}

export default TextField
