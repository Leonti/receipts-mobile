import React, {
    PropTypes,
    StyleSheet,
    View,
    ProgressBarAndroid,
    TextInput,
    Text } from 'react-native';

import { Button } from 'react-native-material-design';

import ErrorView from './ErrorView';

const propTypes = {
    label: PropTypes.any.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired
};

class CredentialsForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: null,
            password: null,
            processing: false,
            error: null
        };

        this.submit = this.submit.bind(this);
    }

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

    render() {
        var signupButton = this.state.processing ? <ProgressBarAndroid indeterminate={true} /> :
        <Button text={this.props.label.toUpperCase()} onPress={this.submit} raised={true} theme="dark" />
        var errorView = this.state.error ? <ErrorView message={this.state.error} /> : null;

        return (
            <View>
                <TextInput
                    onChangeText={(text) => this.setState({username: text})} value={this.state.username} />
                <TextInput
                    onChangeText={(text) => this.setState({password: text})} value={this.state.password} secureTextEntry={true}/>
                {signupButton}
                {errorView}
            </View>
        );
    }
}

CredentialsForm.propTypes = propTypes;
export default CredentialsForm
