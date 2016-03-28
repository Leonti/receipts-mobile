import React, { PropTypes, StyleSheet, View, TouchableHighlight, Text, CameraRoll, Image } from 'react-native';
import ReceiptsPage from './ReceiptsPage';
import Loader from '../components/Loader'
var ImagePickerManager = require('NativeModules').ImagePickerManager;

import Api from '../services/Api';

const propTypes = {
  toRoute: PropTypes.func.isRequired,
  replaceRoute: PropTypes.func.isRequired,
};

class HomePage extends React.Component {

    constructor(props) {
        super(props);
        this.receiptsPage = this.receiptsPage.bind(this);
        this.cameraRoll = this.cameraRoll.bind(this);
        this.camera = this.camera.bind(this);
        this._logout = this._logout.bind(this);

        this.state = {
            imageState: null
        }
    }

    async _logout() {
        await Api.logout();
        this.props.replaceRoute({
            name: "Loader",
            component: Loader
        });
    }

    receiptsPage() {
        this.props.toRoute({
            name: "Receipts",
            component: ReceiptsPage
        });
    }

    async cameraRoll() {
        let receipts = await Api.getReceipts();

        console.log('RECEIPTS', receipts.length);
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

              Api.uploadFile(response.uri).then(function(result) {
                  console.log('file uploaded', result);
              }, function(reason) {
                  console.log('upload failed', reason);
              });

            // uri (on android)
            const source = {uri: response.uri, isStatic: true};

            this.setState({
              imageSource: source
            });

          }
        });
    }

  render() {
      return (
        <View>
          <TouchableHighlight onPress={this._logout} underlayColor="transparent">
            <Text>Logout!</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.receiptsPage} underlayColor="transparent">
            <Text>Receipts</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.cameraRoll} underlayColor="transparent">
            <Text>User Receipts</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.camera} underlayColor="transparent">
            <Text>Camera</Text>
          </TouchableHighlight>
          <Image
              source={this.state.imageSource}
              style={{ width: 200, height: 200 }} />
        </View>
      );
  }

}

HomePage.propTypes = propTypes;
export default HomePage;
