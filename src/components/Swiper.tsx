import React, { Component } from 'react'
import {
  View,
  PanResponder,
  PanResponderInstance,
  PanResponderCallbacks
} from 'react-native'

export type Props = {
  onLeftSwipe: () => void,
  onRightSwipe: () => void
}

type State = {
  left: number
}

class Swiper extends Component<Props, State> {

  private panResponder: PanResponderInstance

  constructor(props) {
    super(props)
    this.state = {
      left: 0
    }
  }

  componentWillMount() {
    const callbacks: PanResponderCallbacks = {
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: () => undefined,
      onPanResponderMove: (_, gestureState) => {
        this.setState({
          left: gestureState.dx
        })
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: (_, gestureState) => {
        this.setState({
          left: 0
        })

        if (gestureState.dx > 100) {
          this.props.onRightSwipe()
        } else if (gestureState.dx < -100) {
          this.props.onLeftSwipe()
        }
      },
      onPanResponderTerminate: () => undefined,
      onShouldBlockNativeResponder: () => true
    }

    this.panResponder = PanResponder.create(callbacks)
  }

  render() {
    return (
      <View style={{
        flex: 1,
        position: 'relative',
        left: this.state.left,
        backgroundColor: 'white'
      }}
        {...this.panResponder.panHandlers}>
        {this.props.children}
      </View>
    )
  }
}

export default Swiper
