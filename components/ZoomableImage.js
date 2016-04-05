import React, { Text, View, PanResponder, Image } from 'react-native';

/*
const propTypes = {
  width: PropTypes.func.isRequired,
  height: PropTypes.func.isRequired,
};
*/

function calcDistance(x1, y1, x2, y2) {
    let dx = Math.abs(x1 - x2)
    let dy = Math.abs(y1 - y2)
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function calcCenter(x1, y1, x2, y2) {

    function middle(p1, p2) {
        return p1 > p2 ? p1 - (p1 - p2) / 2 : p2 - (p2 - p1) / 2;
    }

    return {
        x: middle(x1, x2),
        y: middle(y1, y2),
    };
}

function maxOffset(offset, windowWidth, width) {
    let max = windowWidth - width;
    return offset < max ? max : offset;
}

function calcOffsetByZoom(width, height, zoom) {
    let xDiff = width * zoom - width;
    let yDiff = height * zoom - height;
    return {
        left: -xDiff/2,
        top: -yDiff/2,
    }
}

class ZoomableImage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            zoom: 1,
            isZooming: false,
            isMoving: false,
            initialDistance: null,
            initialX: null,
            initalY: null,
            initialTop: 0,
            initialLeft: 0,
            initialTopWithoutZoom: 0,
            initialLeftWithoutZoom: 0,
            initialZoom: 1,
            top: 0,
            left: 0
        }
    }

    processPinch(x1, y1, x2, y2) {
        let distance = calcDistance(x1, y1, x2, y2);
        let center = calcCenter(x1, y1, x2, y2);

        if (!this.state.isZooming) {
            let offsetByZoom = calcOffsetByZoom(this.props.style.width, this.props.style.height, this.state.zoom);
            this.setState({
                isZooming: true,
                initialDistance: distance,
                initialX: center.x,
                initialY: center.y,
                initialTop: this.state.top,
                initialLeft: this.state.left,
                initialZoom: this.state.zoom,
                initialTopWithoutZoom: this.state.top - offsetByZoom.top,
                initialLeftWithoutZoom: this.state.left - offsetByZoom.left,
            });

        } else {
            let touchZoom = distance / this.state.initialDistance;
            let zoom = touchZoom * this.state.initialZoom > 1
                ? touchZoom * this.state.initialZoom : 1;

            let offsetByZoom = calcOffsetByZoom(this.props.style.width, this.props.style.height, zoom);
            let left = (this.state.initialLeftWithoutZoom * touchZoom) + offsetByZoom.left;
            let top = (this.state.initialTopWithoutZoom * touchZoom) + offsetByZoom.top;

            this.setState({
                zoom: zoom,
                left: left > 0 ? 0 : maxOffset(left, this.props.style.width, this.props.style.width * zoom),
                top: top > 0 ? 0 : maxOffset(top, this.props.style.height, this.props.style.height * zoom),
            });
        }
    }

    processTouch(x, y) {
        if (!this.state.isMoving) {
            this.setState({
                isMoving: true,
                initialX: x,
                initialY: y,
                initialTop: this.state.top,
                initialLeft: this.state.left,
            });
        } else {
            let left = this.state.initialLeft + x - this.state.initialX;
            let top = this.state.initialTop + y - this.state.initialY;

            function maxOffset(offset, windowWidth, width) {
                let max = windowWidth - width;
                return offset < max ? max : offset;
            }

            this.setState({
                left: left > 0 ? 0 : maxOffset(left, this.props.style.width, this.props.style.width * this.state.zoom),
                top: top > 0 ? 0 : maxOffset(top, this.props.style.height, this.props.style.height * this.state.zoom),
            });
        }
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({  // Ask to be the responder:

            onStartShouldSetPanResponder: (evt, gestureState) => false,

            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                let maxTop = this.props.style.height - (this.props.style.height * this.state.zoom);

                // bottom of scaled image matches the bottom of ZoomableImage
                if (gestureState.dy < 0 && this.state.top < 0 && this.state.top == maxTop) {
                    return false;
                // top of scaled image matche the top of ZoomableImage
                } else if (gestureState.dy > 0 && this.state.top == 0) {
                    return false;
                }
                return true;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
            onPanResponderGrant: (evt, gestureState) => {
                console.log('RESPONDER GRANT');
            },
            onPanResponderMove: (evt, gestureState) => {
                let touches = evt.nativeEvent.touches;
                if (touches.length == 2) {
                    let touch1 = touches[0];
                    let touch2 = touches[1];

                    this.processPinch(touches[0].pageX, touches[0].pageY,
                        touches[1].pageX, touches[1].pageY);
                } else if (touches.length == 1) {
                    this.processTouch(touches[0].pageX, touches[0].pageY);
                }
            },

            onPanResponderTerminationRequest: (evt, gestureState) => true, onPanResponderRelease: (evt, gestureState) => {  // The user has released all touches while this view is the
                // responder. This typically means a gesture has succeeded
                console.log('ON TERMINATION REQUEST');
                this.setState({
                    isZooming: false,
                    isMoving: false
                });
            },
            onPanResponderTerminate: (evt, gestureState) => {  // Another component has become the responder, so this gesture
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {  // Returns whether this component should block native components from becoming the JS
     // responder. Returns true by default. Is currently only supported on android.
                return true;
            },
        });
    }

    render() {
        return (
          <View style={{ width: this.props.style.width, height: this.props.style.height, backgroundColor: 'blue' }}
          {...this._panResponder.panHandlers}>
             <Image style={{
                    position: 'absolute',
                    top: this.state.top,
                    left: this.state.left,
                    width: this.props.style.width * this.state.zoom,
                    height: this.props.style.height * this.state.zoom
             }}
             source={{uri: 'http://facebook.github.io/react/img/logo_og.png'}} />
          </View>
        );
    }

}

export default ZoomableImage;
