import React, { Component } from 'react'
import { reduxForm, Field } from 'redux-form'
import { Sprite } from './ThemeSprites'

class PlayerForm extends Component {

  render() {
    const { handleSubmit, tokens, player } = this.props

    return (
      <form onSubmit={handleSubmit}>
        <p><Field name="name" component="input" type="text"/></p>
        <p>{tokens.map((key) => (
          <label key={key}>
            <Field name="token" type="radio" component="input" value={key}/>
            <Sprite name={key}/>
          </label>
        ))}</p>
        <p><button type="submit">Submit</button></p>
      </form>
    )
  }
}

export default reduxForm({
  form: 'player'
})(PlayerForm)
