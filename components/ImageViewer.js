import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableHighlight,
    StyleSheet,
} from 'react-native';
import ZoomableImage from './ZoomableImage';
import DateTimeSelector from './DateTimeSelector';
var Icon = require('react-native-vector-icons/MaterialIcons');

class ImageViewer extends Component {

    _renderEditForm(props) {

        function formatTotal(total) {
            return total !== null && total !== undefined ? total.toString(): null;
        }

        return (
            <View style={styles.editArea}>
                <View style={styles.form}>
                    <Text style={styles.totalLabel}>$</Text>
                    <TextInput style={styles.totalInput}
                        keyboardType='numeric'
                        value={formatTotal(props.total)}
                        onChangeText={total => {
                            props.onModifiedReceipt({total});
                        }}
                     />
                    <DateTimeSelector
                        timestamp={props.transactionTime}
                        onChange={transactionTime => {
                            props.onModifiedReceipt({transactionTime});
                        }}
                    />
                </View>
            </View>
        )
    }

    render() {

        const editForm = this.props.isBeingEdited ? this._renderEditForm(this.props) : null;

        return (
            <View style={{
                flex: 1,
                backgroundColor: 'black'
            }}>
                <ZoomableImage style={{
                    flex: 1
                  }}
                  imageWidth={this.props.imageWidth}
                  imageHeight={this.props.imageHeight}
                  source={this.props.source}
                />
                {editForm}
                <TouchableHighlight onPress={this.props.onClose} style={styles.closeButton}>
                    <Icon name="close" size={30} color='white'/>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    closeButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 20
    },

    editArea: {
        backgroundColor: 'white'
    },

    form: {
        flexWrap: 'wrap',
        alignItems: 'center',
        flexDirection:'row',
        justifyContent: 'space-between',
        paddingRight: 20,
        paddingLeft: 20,
    },

    totalInput: {
        width: 100,
        fontSize: 25,
        padding: 5
    },

    totalLabel: {
        fontSize: 30,
    }
});

ImageViewer.propTypes = {
    source: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    isBeingEdited: PropTypes.bool.isRequired,
    total: PropTypes.any,
    transactionTime: PropTypes.number.isRequired,

    onClose: PropTypes.func.isRequired,
    onModifiedReceipt: PropTypes.func.isRequired,
};
export default ImageViewer;
