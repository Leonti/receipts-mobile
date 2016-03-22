import React, { PropTypes, StyleSheet, View, TouchableHighlight, Text, CameraRoll } from 'react-native';
import LoginPage from './LoginPage';
import ReceiptsPage from './ReceiptsPage';

const propTypes = {
  toRoute: PropTypes.func.isRequired,
};

class HomePage extends React.Component {

    constructor(props) {
        super(props);
        this.loginPage = this.loginPage.bind(this);
        this.receiptsPage = this.receiptsPage.bind(this);
        this.cameraRoll = this.cameraRoll.bind(this);
    }

    loginPage() {
        this.props.toRoute({
            name: "Login",
            component: LoginPage
        });
    }

    receiptsPage() {
        this.props.toRoute({
            name: "Receipts",
            component: ReceiptsPage
        });
    }

// https://facebook.github.io/react-native/docs/native-modules-android.html
// http://developer.android.com/training/camera/photobasics.html

    async cameraRoll() {
        let params = {
            first: 10,
        //    groupTypes: 'All',
            assetType: 'Photos',
        };
        let photos = await CameraRoll.getPhotos(params);

        console.log(photos);
    }

  render() {
      return (
        <View>
          <TouchableHighlight onPress={this.loginPage} underlayColor="transparent">
            <Text>Login!</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.receiptsPage} underlayColor="transparent">
            <Text>Receipts</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.cameraRoll} underlayColor="transparent">
            <Text>CameraRoll</Text>
          </TouchableHighlight>
        </View>
      );
  }

}

HomePage.propTypes = propTypes;
export default HomePage;
