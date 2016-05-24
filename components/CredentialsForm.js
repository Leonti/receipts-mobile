import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    ProgressBarAndroid,
    TextInput,
    TouchableHighlight,
    Text } from 'react-native';

import ErrorView from './ErrorView';

class CredentialsForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: null,
            password: null,
        };
    }
/*
    async submit() {
        console.log('Submitting form with ' + this.state.username + ' ' + this.state.password);

        try {
            this.setState({processing: true});
            let result = await this.props.onSubmit(this.state.username, this.state.password);
            console.log('Form processed');
            console.log(result);
            this.setState({processing: false});
            this.props.onSuccess(result);
        } catch (e) {
            console.log('Exception while processing a form', e);
            this.setState({processing: false});
            this.setState({error: e.message})
        }
    }
*/
    render() {


        var signupButton = this.props.isFetching ? <ProgressBarAndroid indeterminate={true} /> :
        <View style={styles.button}>
            <TouchableHighlight onPress={() => this.props.onSubmit(this.state.username, this.state.password)}>
                <Text>{this.props.label.toUpperCase()}</Text>
            </TouchableHighlight>
        </View>
        var errorView = this.props.error ? <ErrorView message={this.props.error} /> : null;

        return (
            <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.textfield}
                    onChangeText={(text) => this.setState({username: text})} value={this.state.username} />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.textfield}
                    onChangeText={(text) => this.setState({password: text})} value={this.state.password} secureTextEntry={true}/>
                {signupButton}
                {errorView}
            </View>
        );
    }
}

const styles = StyleSheet.create({

    button: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-end'
    }
});

CredentialsForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    label: PropTypes.any.isRequired,
    isFetching: PropTypes.bool,
    error: PropTypes.string,
};
export default CredentialsForm
