import React, {Component, PropTypes} from 'react';
import {
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

import ZoomableImage from '../components/ZoomableImage';
import ImageViewer from '../components/ImageViewer';
import ActionButton from 'react-native-action-button';
import ReceiptFormPage from './ReceiptFormPage';
import ReceiptViewPage from './ReceiptViewPage';
import ReceiptRow from '../components/ReceiptRow';
import NavigationView from '../components/NavigationView';

var Icon = require('react-native-vector-icons/MaterialIcons');

import Api from '../services/Api';
import Receipt from '../services/Receipt';
import ImagePicker from '../services/ImagePicker';

class HomePage extends React.Component {

    constructor(props) {
        super(props);

        this._loadReceipts = this._loadReceipts.bind(this);
        this._showCamera = this._showCamera.bind(this);
        this._showImageLibrary = this._showImageLibrary.bind(this);
        this._processImagePickerResponse = this._processImagePickerResponse.bind(this);
        this._logout = this._logout.bind(this);
        this._createReceipt = this._createReceipt.bind(this);
        this._openReceiptCreateView = this._openReceiptCreateView.bind(this);
        this._openReceiptEditView = this._openReceiptEditView.bind(this);
        this._openReceiptView = this._openReceiptView.bind(this);
        this._renderRow = this._renderRow.bind(this)

//        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        //let dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        //dataSource.cloneWithRows(props.receipts)

        this.state = {
        //    imageState: null,
        //    receipts: [],
            dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
        //    userName: '',
        }
    }

    componentWillMount() {
    //    this._loadReceipts();
    //    this._loadUserInfo();

        if (this.props.receipts.length > 0) {
            this.setState({
              dataSource: this.state.dataSource.cloneWithRows(this.props.receipts)
            })
        }

    //    Api.onReceiptUploaded(() => this._loadReceipts());
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.receipts !== this.props.receipts) {
            this.setState({
              dataSource: this.state.dataSource.cloneWithRows(nextProps.receipts)
            })
        }

        if (nextProps.drawerOpened !== this.props.drawerOpened) {
            console.log('DRAWER STATE', nextProps);
            if (nextProps.drawerOpened) {
                this.refs['DRAWER'].openDrawer()
            } else {
                this.refs['DRAWER'].closeDrawer()
            }
        }
    }

    async _logout() {
        await Api.logout();
        this.props.replaceRoute({
            name: "Loader",
            component: Loader
        });
    }

    async _loadReceipts() {
        /*
        try {
            let receipts = await Api.getReceipts();

            console.log('RECEIPTS', receipts.length);
            this.setState({receipts: receipts});
            this.setState({dataSource: this._ds.cloneWithRows(receipts)});
        } catch (e) {
            console.error('EXCEPTION ON RECEIPT LOADING', e);
            ToastAndroid.show('Failed to load receipts', ToastAndroid.LONG);
        }
        */
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

     _processImagePickerResponse(response) {
        console.log('IMAGES', response);

        if (response.cancelled) {
            return;
        }

        if (response.single) {
/*
            return this._openReceiptCreateView({
                source: {uri: response.single.uri, isStatic: true},
                width: response.single.width,
                height: response.single.height,
            });
*/
            this.props.onFileSelected({
                source: {uri: response.single.uri, isStatic: true},
                width: response.single.width,
                height: response.single.height,
            });

        } else if (response.multiple) {
            ToastAndroid.show('Uploading multiple receipts', ToastAndroid.LONG);

            this.props.onFilesSelected(response.multiple);

            /*
            return Api.batchUpload(response.multiple).then((uploads) => {
                console.log('UPLOAD JOBS', uploads);
            });
            */
        } else {
            console.error('Unknown response from image picker!');
        }
    }

    async _createReceipt(imageUri, total, description) {
        try {
            let upload = await Api.uploadFile(imageUri, total, description).then((uploads) => {
                console.log('UPLOAD JOBS FOR SINGLE', uploads);
            });
            console.log('RECEIPT SENT FOR UPLOAD ', upload);
            this.props.toBack();
            ToastAndroid.show('Receipt is being saved', ToastAndroid.SHORT);
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

    _openReceiptCreateView(image) {

        this.props.toCreateReceipt({
            source: image.source,
            imageWidth: image.width,
            imageHeight: image.height,
            description: '',
            total:'',
        });

        /*
        this.props.toRoute({
            component: ReceiptFormPage,
            passProps: {
                onSave: (receipt) => {
                    return this._createReceipt(image.source.uri, receipt.total, receipt.description);
                },
                noSpinner: true,
                source: image.source,
                imageWidth: image.width,
                imageHeight: image.height,
                description: '',
                total:'',
                title: 'New Receipt',
            }
        });
        */
    }

    _openReceiptEditView(receipts, position, isFirst) {
        let receipt = receipts[position];

        let imageDimensions = Receipt.receiptToImageDimensions(receipt);
        let source = Receipt.receiptToImage(receipt).then((receiptImage) => receiptImage.source);

        let routeFunction = isFirst ? this.props.toRoute : this.props.replaceRoute;
        routeFunction({
            component: ReceiptFormPage,
            passProps: {
                onSave: (fields) => {
                    console.log('UPDATING RECEIPT', receipt);
                    return this._updateReceipt(receipt.id, fields.total, fields.description);
                },
                source: source,
                imageWidth: imageDimensions.width,
                imageHeight: imageDimensions.height,
                description: receipt.description,
                total: receipt.total === undefined ? '' : receipt.total,
                title: 'Edit Receipt',
                onRightSwipe: () => this._onPrevReceipt(receipts, position),
                onLeftSwipe: () => this._onNextReceipt(receipts, position),
            }
        });
    }

    _openReceiptView(receipts, position, isFirst) {
        console.log('OPENING RECEIPT: ' + position, receipts[position]);
        let routeFunction = isFirst ? this.props.toRoute : this.props.replaceRoute;

        routeFunction({
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
                receipt: receipts[position],
                onRightSwipe: () => this._onPrevReceipt(receipts, position),
                onLeftSwipe: () => this._onNextReceipt(receipts, position),
            }
        });
    }

    _onPrevReceipt(receipts, position) {

        if (position > 0) {
            let receipt = receipts[position - 1];
            let receiptView = this._getReceiptPageView(receipt);

            receiptView(receipts, position - 1, false);
        }
    }

    _onNextReceipt(receipts, position) {

        if (position < receipts.length - 1) {
            let receipt = receipts[position + 1];
            let receiptView = this._getReceiptPageView(receipt);

            receiptView(receipts, position + 1, false);
        }
    }

    _getReceiptPageView(receipt) {
        return receipt.total === undefined ? this._openReceiptEditView
            : this._openReceiptView;
    }

    render() {

        let navigationView = <NavigationView
            userName={this.props.userName}
            onLogout={this.props.onLogout}
        />

        return (
            <DrawerLayoutAndroid
                        drawerWidth={250}
                        drawerPosition={DrawerLayoutAndroid.positions.Left}
                        ref={'DRAWER'}
                        onDrawerClose={() => this.props.closeDrawer()}
                        renderNavigationView={() => navigationView}>
                        {this._renderHome()}
            </DrawerLayoutAndroid>
        );
    }

    _renderRow(receipt) {

//        let receiptView = this._getReceiptPageView(receipt);

        return (<ReceiptRow
            onPress={() => {
                //console.log('RECEIPT POSITION', this.state.receipts.indexOf(receipt));
                //receiptView(this.state.receipts, this.state.receipts.indexOf(receipt), true)

                    this.props.toViewReceipt(receipt);

                }
            }
            receipt={receipt} />);
    }

    _renderHome() {

        return (
            <View style={{ flex:1, backgroundColor: '#f3f3f3' }}>
            <Icon.ToolbarAndroid
                style={styles.toolbar}
                title="Your Receipts"
                navIconName="menu"
                onIconClicked={() => this.props.openDrawer()} // this.refs['DRAWER'].openDrawer()
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
                        <Icon name="collections" style={styles.actionButtonIcon} />
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



HomePage.propTypes = {
  receipts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  userName: PropTypes.string,
  error: PropTypes.string,

  openDrawer: PropTypes.func.isRequired,
  closeDrawer: PropTypes.func.isRequired,
  onFileSelected: PropTypes.func.isRequired,
  onFilesSelected: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  toCreateReceipt: PropTypes.func.isRequired,
  toEditReceipt: PropTypes.func.isRequired,
  toViewReceipt: PropTypes.func.isRequired,
};
export default HomePage;
