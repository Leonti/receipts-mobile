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
    RefreshControl,
 } from 'react-native';

import ActionButton from 'react-native-action-button';
import ReceiptRow from '../components/ReceiptRow';
import NavigationView from '../components/NavigationView';

var Icon = require('react-native-vector-icons/MaterialIcons');
import ImagePicker from '../services/ImagePicker';

class HomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
        }
    }

    componentWillMount() {

        if (this.props.receipts.length > 0) {
            this.setState({
              dataSource: this.state.dataSource.cloneWithRows(this.props.receipts)
            })
        }
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

    _showCamera() {
        ImagePicker.takePhoto().then(this._processImagePickerResponse.bind(this), error => {
            console.log('image picker error', error);
            ToastAndroid.show('Failed to choose receipt', ToastAndroid.LONG);
        });
    }

    _showImageLibrary() {
        ImagePicker.pick().then(this._processImagePickerResponse.bind(this), () => {
            ToastAndroid.show('Failed to choose receipt', ToastAndroid.LONG);
        });
    }

     _processImagePickerResponse(response) {
        console.log('IMAGES', response);

        if (response.cancelled) {
            console.log('CANCELLED INAMGE PICKER RESPONSE');
            return;
        }

        if (response.single) {
            this.props.onFileSelected({
                source: {uri: response.single.uri, isStatic: true},
                width: response.single.width,
                height: response.single.height,
            });

        } else if (response.multiple) {
            ToastAndroid.show('Uploading multiple receipts', ToastAndroid.LONG);
            this.props.onFilesSelected(response.multiple);
        } else {
            console.error('Unknown response from image picker!');
        }
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

        return (<ReceiptRow
            onPress={() => this.props.toReceipt(receipt)}
            receipt={receipt} />);
    }

    _pendingReceiptsView(pendingCount) {
        return pendingCount ?
            <Text
                style={styles.pendingFiles}
                >{pendingCount} receipts are being processed</Text>
            : null;
    }

    _renderHome() {

        return (
            <View style={{ flex:1, backgroundColor: '#f3f3f3' }}>
            <Icon.ToolbarAndroid
                style={styles.toolbar}
                title="Your Receipts"
                navIconName="menu"
                onIconClicked={() => this.props.openDrawer()}
                />
                {this._pendingReceiptsView(this.props.pendingCount)}
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
                    renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
                    refreshControl={ <RefreshControl refreshing={this.props.isFetching} onRefresh={this.props.onRefresh} /> }
                />
                <ActionButton buttonColor="#F44336">
                    <ActionButton.Item buttonColor='#03a9f4' title="Take a photo" onPress={this._showCamera.bind(this)}>
                        <Icon name="camera" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#ff9800' title="Choose from library" onPress={this._showImageLibrary.bind(this)}>
                        <Icon name="collections" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                </ActionButton>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    pendingFiles: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#F6F6F6',
        fontSize: 18
    },
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
  pendingCount: PropTypes.number.isRequired,
  isFetching: PropTypes.bool.isRequired,
  userName: PropTypes.string,
  error: PropTypes.string,

  openDrawer: PropTypes.func.isRequired,
  closeDrawer: PropTypes.func.isRequired,
  onFileSelected: PropTypes.func.isRequired,
  onFilesSelected: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  toReceipt: PropTypes.func.isRequired,
};
export default HomePage;
