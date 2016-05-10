import React, {Component, PropTypes} from "react";
import {
    View,
    PanResponder,
} from 'react-native';

class Swiper extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            left: 0
        }
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({  // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderGrant: (evt, gestureState) => {},
            onPanResponderMove: (evt, gestureState) => {
                this.setState({
                    left: gestureState.dx
                });
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                this.setState({
                    left: 0
                });

                if (gestureState.dx > 100) {
                    this.props.onRightSwipe();
                } else if (gestureState.dx < -100) {
                    this.props.onLeftSwipe();
                }
            },
            onPanResponderTerminate: (evt, gestureState) => {},
            onShouldBlockNativeResponder: (evt, gestureState) => true,
        });
    }

    render() {
        return (
            <View style={{
                flex: 1,
                position: 'relative',
                left: this.state.left,
                backgroundColor: 'white',
            }}
            {...this._panResponder.panHandlers}>
            {this.props.children}
            </View>
        );
    }
}

Swiper.propTypes = {
    onLeftSwipe: PropTypes.func.isRequired,
    onRightSwipe: PropTypes.func.isRequired,
};
export default Swiper
