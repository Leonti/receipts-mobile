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
 } from 'react-native';

import Loader from '../components/Loader';
import ZoomableImage from '../components/ZoomableImage';
import ImageViewer from '../components/ImageViewer';
import ReceiptSavePage from './ReceiptSavePage'
import { SaveButton, CloseButton } from '../components/ModalButtons';
import ActionButton from 'react-native-action-button';

var moment = require('moment');

var Icon = require('react-native-vector-icons/Ionicons');

var ImagePickerManager = require('NativeModules').ImagePickerManager;

import Api from '../services/Api';

import ReceiptForm from '../components/ReceiptForm';

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

        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state = {
            imageState: null,
            receipts: [],
            dataSource: this._ds,
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

    async _loadReceipts() {
        try {
            let receipts = await Api.getReceipts();

            console.log('RECEIPTS', receipts.length);
            this.setState({receipts: receipts});
            this.setState({dataSource: this._ds.cloneWithRows(receipts)});
        } catch (e) {
            ToastAndroid.show('Failed to load receipts', ToastAndroid.LONG);
        }
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
            console.log('IMAGE', response);
            this._openReceiptForm({
                source: {uri: response.uri, isStatic: true},
                width: response.isVertical ? response.height : response.width,
                height: response.isVertical ? response.width : response.height,
            });
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

    async _openReceiptForm(image) {

        let receiptData = {
            description: null,
            total: null
        }

        let bus = {};

        this.props.toRoute({
            name: "New receipt",
            component: ReceiptForm,
            leftCorner: CloseButton,
            rightCorner: SaveButton,
            leftCornerProps: {
                onClose: this.props.toBack
            },
            rightCornerProps: {
                onSave: () => {
                    bus.toggleSpinner(true);
                    let hideSpinner = bus.toggleSpinner.bind(this, false);
                    this._createReceipt(image.source.uri, receiptData.total, receiptData.description).then(hideSpinner, hideSpinner);
                }
            },

            passProps: {
                onUpdate: (state) => {
                    receiptData.description = state.description;
                    receiptData.total = state.total;
                },
                source: image.source,
                imageWidth: image.width,
                imageHeight: image.height,
                description: receiptData.description,
                total: receiptData.total,
                bus: bus,
            }
        });
    }

    render() {
        var navigationView = (
            <View style={{flex: 1, backgroundColor: '#fff'}}>
                <TouchableHighlight onPress={this._logout} underlayColor="transparent">
                  <Text>Logout</Text>
                </TouchableHighlight>
            </View>
        );

        return (
            <DrawerLayoutAndroid
                        drawerWidth={200}
                        drawerPosition={DrawerLayoutAndroid.positions.Left}
                        renderNavigationView={() => navigationView}>
                        {this._renderHome()}
            </DrawerLayoutAndroid>
        );
    }

    _renderRow(receipt) {
        return (
            <TouchableHighlight onPress={() => this._pressRow(rowID)}>
                <View>
                    <View style={styles.row}>
                        <Text style={styles.text}>{moment(receipt.timestamp).format('lll')} {receipt.description} {receipt.total}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }

    _renderHome() {
        return (
            <View style={{ flex:1, backgroundColor: '#f3f3f3' }}>
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
    text: {
        flex: 1,
    },
});



HomePage.propTypes = propTypes;
export default HomePage;
