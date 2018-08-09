import React, { StatelessComponent } from 'react'
import {
  View,
  StatusBar
} from 'react-native'

import { connect } from 'react-redux'

import Routing from './PageContainers'

type Props = {
  navigation: {
    page: string
  }
}

const reduxRouter: StatelessComponent<Props> = (props) => {

  const renderScene = () => {
    const pageToRender = Routing[props.navigation.page]

    if (pageToRender) {
      return React.createElement(pageToRender)
    } else {
      return (
        <View>
        </View>
      )
    }
  }

  // '#2196f3'
  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor='#2196f3' />
      {renderScene()}
    </View>
  )

}

const mapStateToProps = (state) => {
  return {
    navigation: state.navigation
  }
}

const reduxRouterWrapped = connect(
  mapStateToProps
)(reduxRouter)

export default reduxRouterWrapped
