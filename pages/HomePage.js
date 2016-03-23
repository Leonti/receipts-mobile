import React, { PropTypes, StyleSheet, View, TouchableHighlight, Text, CameraRoll } from 'react-native';
import LoginPage from './LoginPage';
import ReceiptsPage from './ReceiptsPage';
var ImagePickerManager = require('NativeModules').ImagePickerManager;

const propTypes = {
  toRoute: PropTypes.func.isRequired,
};

class HomePage extends React.Component {

    constructor(props) {
        super(props);
        this.loginPage = this.loginPage.bind(this);
        this.receiptsPage = this.receiptsPage.bind(this);
        this.cameraRoll = this.cameraRoll.bind(this);
        this.camera = this.camera.bind(this);
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

    async camera() {
        var options = {
          title: 'Select Image',
          cancelButtonTitle: 'Cancel',
          takePhotoButtonTitle: 'Take Photo...', // specify null or empty string to remove this button
          chooseFromLibraryButtonTitle: 'Choose from Library...', // specify null or empty string to remove this button
          cameraType: 'back', // 'front' or 'back'
          mediaType: 'photo', // 'photo' or 'video'
          quality: 1, // 0 to 1, photos only
          angle: 0, // android only, photos only
          allowsEditing: false, // Built in functionality to resize/reposition the image after selection
          noData: true,
        };

        ImagePickerManager.showImagePicker(options, (response) => {
          console.log('Response = ', response);

          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePickerManager Error: ', response.error);
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {

            // uri (on android)
            const source = {uri: response.uri, isStatic: true};
/*
            this.setState({
              avatarSource: source
            });
            */
          }
        });
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
          <TouchableHighlight onPress={this.camera} underlayColor="transparent">
            <Text>Camera</Text>
          </TouchableHighlight>
        </View>
      );
  }

}

HomePage.propTypes = propTypes;
export default HomePage;
