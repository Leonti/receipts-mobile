import React, { PropTypes, StyleSheet, View, TouchableHighlight, Text, Image } from 'react-native';
import ReceiptsPage from './ReceiptsPage';
import Loader from '../components/Loader'
import ActionButton from 'react-native-action-button';

var Icon = require('react-native-vector-icons/Ionicons');

var ImagePickerManager = require('NativeModules').ImagePickerManager;

import Api from '../services/Api';

const propTypes = {
  toRoute: PropTypes.func.isRequired,
  replaceRoute: PropTypes.func.isRequired,
};

const imagePickerOptions = {
    cameraType: 'back',
    mediaType: 'photo',
    quality: 1,
    allowsEditing: false,
    noData: true,
};

class HomePage extends React.Component {

    constructor(props) {
        super(props);
        this.receiptsPage = this.receiptsPage.bind(this);
        this._loadReceipts = this._loadReceipts.bind(this);
        this._showCamera = this._showCamera.bind(this);
        this._showImageLibrary = this._showImageLibrary.bind(this);
        this._processImagePickerResponse = this._processImagePickerResponse.bind(this);
        this._logout = this._logout.bind(this);

        this.state = {
            imageState: null,
            receipts: []
        }
    }

    componentWillMount() {
        this._loadReceipts();
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

    async _loadReceipts() {
        let receipts = await Api.getReceipts();

        console.log('RECEIPTS', receipts.length);
        this.setState({receipts: receipts});
    }

    _showCamera() {
        ImagePickerManager.launchCamera(imagePickerOptions, this._processImagePickerResponse);
    }

    _showImageLibrary() {
        ImagePickerManager.launchImageLibrary(imagePickerOptions, this._processImagePickerResponse);
    }

    async _processImagePickerResponse(response) {
        if (response.uri) {

            // uri (on android)
            const source = {uri: response.uri, isStatic: true};

            this.setState({
                imageSource: source
            });

            try {
                let receipt = await Api.uploadFile(response.uri);
                this._loadReceipts();
            } catch (e) {
                console.log('Upload failed ' + e.message);
            }
        }
    }

    async camera() {
        ImagePickerManager.showImagePicker(options, (response) => {
          console.log('Response = ', response);
        });
    }

  render() {
      return (
        <View style={{flex:1, backgroundColor: '#f3f3f3'}}>
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
          <Text>Total receipts {this.state.receipts.length}</Text>
          <Image
              source={this.state.imageSource}
              style={{ width: 200, height: 200 }} />



         <ActionButton buttonColor="#F44336">
            <ActionButton.Item buttonColor='#03a9f4' title="Take a photo" onPress={this._showCamera}>
                <Icon name="camera" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item buttonColor='#ff9800' title="Choose from library" onPress={this._showImageLibrary}>
                <Icon name="images" style={styles.actionButtonIcon} />
            </ActionButton.Item>
         </ActionButton>
        </View>
      );
  }

}

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
});

HomePage.propTypes = propTypes;
export default HomePage;
