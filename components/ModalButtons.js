import React, { PropTypes, View, TouchableHighlight, Text } from 'react-native';
var Icon = require('react-native-vector-icons/Ionicons');

class CloseButton extends React.Component {
    render() {
        return (
        <View style={{flex: 1, width: 50, alignItems: 'center'}}>
            <TouchableHighlight onPress={this.props.onClose} underlayColor="transparent">
                <Icon name="android-close" style={{ fontSize: 25, color: 'white' }} />
            </TouchableHighlight>
        </View>
        );
    }
}

CloseButton.propTypes = {
    onClose: PropTypes.func.isRequired
}

class SaveButton extends React.Component {
    render() {
        return (
        <View style={{flex: 1, alignItems: 'center', paddingRight: 10}}>
            <TouchableHighlight onPress={this.props.onSave} underlayColor="transparent">
                <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>Save</Text>
            </TouchableHighlight>
        </View>
        );
    }
}

SaveButton.propTypes = {
    onSave: PropTypes.func.isRequired
}

module.exports = {
    CloseButton: CloseButton,
    SaveButton: SaveButton
}
