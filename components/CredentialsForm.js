import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    ProgressBarAndroid,
    TextInput,
    TouchableHighlight,
    Text } from 'react-native';

import Button from './third-party/mrn/Button'

import ErrorView from './ErrorView';

class CredentialsForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: null,
            password: null,
        };
    }

    render() {

        var button = this.props.isFetching ? <ProgressBarAndroid indeterminate={true} /> :
            <Button value={this.props.label.toUpperCase()} raised={true} theme="dark" color="paperBrown"
                onPress={() => this.props.onSubmit(this.state.username, this.state.password)}
            />
        var errorView = this.props.error ? <ErrorView message={this.props.error} /> : null;

        return (
            <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.textfield}
                    onChangeText={(text) => this.setState({username: text})}
                    value={this.state.username} />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.textfield}
                    onChangeText={(text) => this.setState({password: text})}
                    value={this.state.password} secureTextEntry={true}/>
                {button}
                <View style={styles.errorView}>{errorView}</View>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    label: {
        fontSize: 20,
    },

    textfield: {
        fontSize: 20,
        marginBottom: 15,
    },

    errorView: {
        marginTop: 15,
    }
});

CredentialsForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    label: PropTypes.any.isRequired,
    isFetching: PropTypes.bool,
    error: PropTypes.string,
};
export default CredentialsForm
