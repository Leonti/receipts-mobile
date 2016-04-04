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

    componentWillMount() {
        this._panResponder = PanResponder.create({  // Ask to be the responder:

            onStartShouldSetPanResponder: (evt, gestureState) => true,

            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderGrant: (evt, gestureState) => {
                console.log('RESPONDER GRANT');
                // The guesture has started. Show visual feedback so the user knows
                // what is happening!
                // gestureState.{x,y}0 will be set to zero now
            },
            onPanResponderMove: (evt, gestureState) => {  // The most recent move distance is gestureState.move{X,Y}
                // The accumulated gesture distance since becoming responder is
                // gestureState.d{x,y}
            //    console.log(gestureState);

                let touches = evt.nativeEvent.touches;
                if (touches.length == 2) {
                    let touch1 = touches[0];
                    let touch2 = touches[1];

                    let distance = calcDistance(touch1.pageX, touch1.pageY, touch2.pageX, touch2.pageY);
                    let center = calcCenter(touch1.pageX, touch1.pageY, touch2.pageX, touch2.pageY);

                    if (!this.state.isZooming) {

                        let xDiff = this.props.style.width * this.state.zoom - this.props.style.width;
                        let yDiff = this.props.style.height * this.state.zoom - this.props.style.height;
                        let leftByZoom = -xDiff/2;
                        let topByZoom = -yDiff/2;

                        this.setState({
                            isZooming: true,
                            initialDistance: distance,
                            initialX: center.x,
                            initialY: center.y,
                            initialTop: this.state.top,
                            initialLeft: this.state.left,
                            initialZoom: this.state.zoom,
                            initialTopWithoutZoom: this.state.top - topByZoom,
                            initialLeftWithoutZoom: this.state.left - leftByZoom,
                        });

//console.log('INITIAL TOP WITHOUT ZOOM', this.state.initialTopWithoutZoom);
//console.log('INITIAL LEFT WITHOUT ZOOM', this.state.initialLeftWithoutZoom);

                    } else {
                        let touchZoom = distance / this.state.initialDistance;
                        let unboundedZoom = touchZoom * this.state.initialZoom;
                        let zoom = unboundedZoom > 1 ? unboundedZoom : 1;

                        let xDiff = this.props.style.width * zoom - this.props.style.width;
                        let yDiff = this.props.style.height * zoom - this.props.style.height;
                        let leftByZoom = -xDiff/2;
                        let topByZoom = -yDiff/2;

                        let left = (this.state.initialLeftWithoutZoom * touchZoom) + leftByZoom;
                        let top = (this.state.initialTopWithoutZoom * touchZoom) + topByZoom;

                        this.setState({
                            zoom: zoom,
                            left: left > 0 ? 0 : maxOffset(left, this.props.style.width, this.props.style.width * zoom),
                            top: top > 0 ? 0 : maxOffset(top, this.props.style.height, this.props.style.height * zoom),
                        });
                    }
                } else if (touches.length == 1) {
                    let x = touches[0].pageX;
                    let y = touches[0].pageY;

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
            },

            onPanResponderTerminationRequest: (evt, gestureState) => true, onPanResponderRelease: (evt, gestureState) => {  // The user has released all touches while this view is the
                // responder. This typically means a gesture has succeeded
                console.log('ON TERMINATION REQUEST');
                this.setState({
                    isZooming: false,
                    isMoving: false,
                    initialDistance: null,
                    initialZoom: this.state.zoom
                });
            },
            onPanResponderTerminate: (evt, gestureState) => {  // Another component has become the responder, so this gesture
                console.log('ON TERMINATE');
                // should be cancelled
                this.setState({
                    isZooming: false,
                    isMoving: false,
                    initialDistance: null,
                    initialZoom: this.state.zoom
                });
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
