import React, {
    PropTypes,
    StyleSheet,
    View,
    ProgressBarAndroid,
    TextInput,
    TouchableHighlight,
    Text } from 'react-native';

import { Button } from 'react-native-material-design';

var Icon = require('react-native-vector-icons/Ionicons');

const propTypes = {
    onUpdate: PropTypes.func.isRequired
};

class ReceiptForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            description: null
        };

        console.log(this);
    }

    componentWillUpdate(nextProps, nextState) {
        this.props.onUpdate(nextState);
    }

    render() {
        return (
            <View style={{ backgroundColor: 'green', flex: 1}}>
                <Text>Notes(optional):</Text>
                <TextInput style={{ height: 100, textAlignVertical: 'top'}}
                    onChangeText={(text) => this.setState({description: text})}
                    multiline={true}
                    value={this.state.notes} />
            </View>
        );
    }
}

ReceiptForm.propTypes = propTypes;
export default ReceiptForm
