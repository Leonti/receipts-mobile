import React, {
    PropTypes,
    StyleSheet,
    View,
    TouchableHighlight,
    Text,
    Image,
    ListView,
    ScrollView,
    ToastAndroid,
    DrawerLayoutAndroid,
    RecyclerViewBackedScrollView,
    CameraRoll,
 } from 'react-native';

import Loader from '../components/Loader';
import ZoomableImage from '../components/ZoomableImage';
import ImageViewer from '../components/ImageViewer';
import ActionButton from 'react-native-action-button';
import ReceiptFormPage from './ReceiptFormPage';
import ReceiptViewPage from './ReceiptViewPage';
import ReceiptRow from '../components/ReceiptRow';
import NavigationView from '../components/NavigationView';



var Icon = require('react-native-vector-icons/Ionicons');

import Api from '../services/Api';
import ImagePicker from '../services/ImagePicker';

const propTypes = {
  toRoute: PropTypes.func.isRequired,
  replaceRoute: PropTypes.func.isRequired,
  resetToRoute: PropTypes.func.isRequired
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

        this._loadReceipts = this._loadReceipts.bind(this);
        this._showCamera = this._showCamera.bind(this);
        this._showImageLibrary = this._showImageLibrary.bind(this);
        this._processImagePickerResponse = this._processImagePickerResponse.bind(this);
        this._logout = this._logout.bind(this);
        this._createReceipt = this._createReceipt.bind(this);
        this._openReceiptForm = this._openReceiptForm.bind(this);
        this._openReceiptView = this._openReceiptView.bind(this);
        this._renderRow = this._renderRow.bind(this)

        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state = {
            imageState: null,
            receipts: [],
            dataSource: this._ds,
            userName: '',
        }
    }

    componentWillMount() {
        this._loadReceipts();
        this._loadUserInfo();
/*
        CameraRoll.getPhotos({
                first: 5,
                assetType: 'Photos',
            })
              .then((photos) => {

                  console.log('PHOTOS', photos);
                  return Api.batchUpload(['content://media/external/images/media/23', 'content://media/external/images/media/17']);
              }, (e) => console.error(e));
*/


    }

    async _logout() {
        await Api.logout();
        this.props.replaceRoute({
            name: "Loader",
            component: Loader
        });
    }

    async _loadReceipts() {
        try {
            let receipts = await Api.getReceipts();

            console.log('RECEIPTS', receipts.length);
            this.setState({receipts: receipts});
            this.setState({dataSource: this._ds.cloneWithRows(receipts)});
        } catch (e) {
            console.error('EXCEPTION ON RECEIPT LOADING', e);
            ToastAndroid.show('Failed to load receipts', ToastAndroid.LONG);
        }
    }

    async _loadUserInfo() {
        let userInfo = await Api.getUserInfo();

        this.setState({
            userName: userInfo.userName,
        });
    }

    _showCamera() {
        ImagePicker.takePhoto().then(this._processImagePickerResponse, () => {
            ToastAndroid.show('Failed to choose receipt', ToastAndroid.LONG);
        });
    }

    _showImageLibrary() {
        ImagePicker.pick().then(this._processImagePickerResponse, () => {
            ToastAndroid.show('Failed to choose receipt', ToastAndroid.LONG);
        });
    }

    async _processImagePickerResponse(uris) {
        console.log('IMAGES', uris);
        if (uris.length == 0) {
            return;
        }

        if (uris.length == 1) {
            this._openReceiptForm({
                source: {uri: uris[0].uri, isStatic: true},
                width: uris[0].width,
                height: uris[0].height,
            });
        } else {
            ToastAndroid.show('Uploading multiple receipts', ToastAndroid.LONG);
            return Api.batchUpload(uris.map(uri => uri.uri));    
        }
    }

    async _createReceipt(imageUri, total, description) {
        try {
            let receipt = await Api.uploadFile(imageUri, total, description);
            console.log('RECEIPT UPLOADED ', receipt);
            this.props.toBack();
            ToastAndroid.show('Receipt saved', ToastAndroid.SHORT);
            this._loadReceipts();
        } catch (e) {
            console.log('Upload failed ' + e.message);
            ToastAndroid.show('Failed to save the receipt', ToastAndroid.LONG);
        }
    }

    async _updateReceipt(receiptId, total, description) {
        try {
            let receipt = await Api.updateReceipt(receiptId, {
                total: total,
                description: description
            });
            console.log('RECEIPT UPDATED ', receipt);
            this.props.toBack();
            ToastAndroid.show('Receipt updated', ToastAndroid.SHORT);
            this._loadReceipts();
        } catch (e) {
            console.log('Update failed ' + e.message);
            ToastAndroid.show('Failed to update receipt', ToastAndroid.LONG);
        }
    }

    async _deleteReceipt(receiptId) {
        try {
            await Api.deleteReceipt(receiptId);

            console.log('RECEIPT DELETED ', receiptId);
            this.props.toBack();
            ToastAndroid.show('Receipt deleted', ToastAndroid.SHORT);
            this._loadReceipts();
        } catch (e) {
            console.log('Delete failed ' + e.message);
            ToastAndroid.show('Failed to delete receipt', ToastAndroid.LONG);
        }
    }

    async _openReceiptForm(image) {

        this.props.toRoute({
            component: ReceiptFormPage,
            passProps: {
                onSave: (receipt) => {
                    return this._createReceipt(image.source.uri, receipt.total, receipt.description);
                },
                source: image.source,
                imageWidth: image.width,
                imageHeight: image.height,
                description: '',
                total:'',
            }
        });
    }

    async _openReceiptView(receipt) {
        console.log('OPENING RECEIPT: ', receipt);

        this.props.toRoute({
            component: ReceiptViewPage,
            passProps: {
                onSave: (fields) => {
                    console.log('UPDATING RECEIPT', receipt);
                    return this._updateReceipt(receipt.id, fields.total, fields.description);
                },
                onDelete: () => {
                    console.log('DELETING RECEIPT', receipt);
                    return this._deleteReceipt(receipt.id);
                },
                receipt: receipt
            }
        });
    }

    render() {
        let navigationView = <NavigationView
            userName={this.state.userName}
            onLogout={this._logout}
        />

        return (
            <DrawerLayoutAndroid
                        drawerWidth={250}
                        drawerPosition={DrawerLayoutAndroid.positions.Left}
                        ref={'DRAWER'}
                        renderNavigationView={() => navigationView}>
                        {this._renderHome()}
            </DrawerLayoutAndroid>
        );
    }

    _renderRow(receipt) {
        let openReceiptView = this._openReceiptView.bind(this);
        return (<ReceiptRow
            onPress={() => this._openReceiptView(receipt)}
            receipt={receipt} />);
    }

    _renderHome() {

        return (
            <View style={{ flex:1, backgroundColor: '#f3f3f3' }}>
            <Icon.ToolbarAndroid
                style={styles.toolbar}
                title="Your Receipts"
                navIconName="android-menu"
                onIconClicked={() => this.refs['DRAWER'].openDrawer()}
                />
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow}
                    renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
                    renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
                />
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
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#F6F6F6',
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC',
    },
    toolbar: {
        backgroundColor: '#e9eaed',
        height: 56,
    },
    rowText: {
        flex: 1,
        fontSize: 20,
    },
});



HomePage.propTypes = propTypes;
export default HomePage;
