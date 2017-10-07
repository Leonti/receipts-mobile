import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TextInput,
  Text
} from 'react-native'

import Button from './third-party/mrn/Button'

import ErrorView from './ErrorView'

export type Props = {
  onSubmit: (username: string, password: string) => void,
  label: string,
  isFetching: boolean,
  error: string
}

type State = {
  username: string,
  password: string
}

class CredentialsForm extends Component<Props, State> {

  constructor(props) {
    super(props)
    this.state = {
      username: undefined,
      password: undefined
    }
  }

  render() {

    let button = this.props.isFetching ? <ActivityIndicator size='large' /> :
      <Button value={this.props.label.toUpperCase()} raised={true} theme='dark' color='paperBrown'
        onPress={() => this.props.onSubmit(this.state.username, this.state.password)}
      />
    let errorView = this.props.error ? <ErrorView message={this.props.error} /> : undefined

    return (
      <View>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.textfield}
          onChangeText={(text) => this.setState({ username: text })}
          value={this.state.username} />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.textfield}
          onChangeText={(text) => this.setState({ password: text })}
          value={this.state.password} secureTextEntry={true} />
        {button}
        <View style={styles.errorView}>{errorView}</View>
      </View>
    )
  }
}

const styles = StyleSheet.create({

  label: {
    fontSize: 20
  },

  textfield: {
    fontSize: 20,
    marginBottom: 15
  },

  errorView: {
    marginTop: 15
  }
})

export default CredentialsForm
