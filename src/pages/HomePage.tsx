import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ListRenderItemInfo,
  ToastAndroid,
  DrawerLayoutAndroid,
  TextInput
} from 'react-native'

import ActionButton from 'react-native-action-button'
import ReceiptRow from '../components/ReceiptRow'
import NavigationView from '../components/NavigationView'

import Icon from 'react-native-vector-icons/MaterialIcons'
import { ImagePicker } from '../services/ImagePicker'
import { Receipt } from '../services/Api'
import { Action } from '../actions/receipt'
import { ReceiptImage } from '../types'

export type HomePageProps = {
  receipts: Receipt[],
  pendingCount: number,
  isFetching: boolean,
  userName?: string,
  error?: string,
  drawerOpened: boolean,
  isSearching: boolean,
  query: string
}

export type HomePageDispatch = {
  openDrawer: () => Action,
  closeDrawer: () => Action,
  toReceipt: (receipt: Receipt) => void,
  onFileSelected: (image: ReceiptImage) => void,
  onFilesSelected: (fileList: any) => void,
  onSearchStarted: () => void,
  onSearchFinished: () => void,
  onSearch: (query: string) => void,
  onLogout: () => void,
  onRefresh: () => void,
  onMount: () => void,
  onUnmount: () => void
}

type State = {
  receipts: Receipt[]
}

class HomePage extends Component<HomePageProps & HomePageDispatch, State> {

  private drawer?: DrawerLayoutAndroid

  constructor(props) {
    super(props)

    this.state = {
      receipts: []
    }
  }

  componentDidMount() {
    this.props.onMount()
  }

  componentWillUnmount() {
    this.props.onUnmount()
  }

  componentWillReceiveProps(nextProps: HomePageProps & HomePageDispatch) {
    if (nextProps.drawerOpened !== this.props.drawerOpened) {

      if (nextProps.drawerOpened) {
        this.drawer.openDrawer()
      } else {
        this.drawer.closeDrawer()
      }
    }
  }

  _showCamera() {
    ImagePicker.takePhoto().then(this._processImagePickerResponse.bind(this), error => {
      console.log('image picker error', error)
      ToastAndroid.show('Failed to choose receipt', ToastAndroid.LONG)
    })
  }

  _showImageLibrary() {
    ImagePicker.pick().then(this._processImagePickerResponse.bind(this), () => {
      ToastAndroid.show('Failed to choose receipt', ToastAndroid.LONG)
    })
  }

  _processImagePickerResponse(response) {
    console.log('IMAGES', response)

    if (response.cancelled) {
      console.log('CANCELLED INAMGE PICKER RESPONSE')
      return
    }

    if (response.single) {
      this.props.onFileSelected({
        source: { uri: response.single.uri },
        width: response.single.width,
        height: response.single.height
      })

    } else if (response.multiple) {
      ToastAndroid.show('Uploading multiple receipts', ToastAndroid.LONG)

      response.multiple.forEach(image => console.log('URI: ' + image))

      this.props.onFilesSelected(response.multiple)
    } else {
      console.error('Unknown response from image picker!')
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
        drawerPosition={(DrawerLayoutAndroid as any).positions.Left}
        ref={(d: any) => { this.drawer = d }}
        onDrawerClose={() => this.props.closeDrawer()}
        renderNavigationView={() => navigationView}>
        {this._renderHome()}
      </DrawerLayoutAndroid>
    )
  }

  _renderRow(info: ListRenderItemInfo<Receipt>) {

    return (<ReceiptRow
      onPress={() => this.props.toReceipt(info.item)}
      receipt={info.item} />)
  }

  _pendingReceiptsView(pendingCount: Number) {
    return pendingCount ?
      <Text
        style={styles.pendingFiles}
      >Receipts are being processed</Text>
      : undefined
  }

  onActionSelected(position: Number) {
    if (this.props.isSearching) {
      this.props.onSearchFinished()
    } else {
      this.props.onSearchStarted()
    }
    console.log('Selected search')
  }

  private onSearchChange(value: string) {
    if (value !== '') {
      this.props.onSearch(value)
    }
  }

  _renderHome() {

    const receiptCount = this.props.receipts.length
    const headerTitle = 'Your Receipts' + (receiptCount > 0 ?
      ' (' + receiptCount + ')' : '')

    const keyExtractor = (item: Receipt, index: Number) => item.id;

    const actions = this.props.isSearching ? [{ iconName: 'close', title: 'Close', show: 'always' }]
      : [{ iconName: 'search', title: 'Find', show: 'always' }]

    const searchBox = this.props.isSearching ? <TextInput
      style={styles.searchInput}
      value={this.props.query}
      placeholder="Search ..."
      onChangeText={this.onSearchChange.bind(this)}
    /> : null 

    return (
      <View style={{ flex: 1, backgroundColor: '#f3f3f3' }}>
        <Icon.ToolbarAndroid
          style={styles.toolbar}
          title={headerTitle}
          actions={actions}
          navIconName='menu'
          onActionSelected={this.onActionSelected.bind(this)}
          onIconClicked={this.props.openDrawer}
        />
        {this._pendingReceiptsView(this.props.pendingCount)}
        {searchBox}
        <FlatList
          data={this.props.receipts}
          renderItem={this._renderRow.bind(this)}
          refreshing={this.props.isFetching}
          keyExtractor={keyExtractor}
          onRefresh={this.props.onRefresh}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
        />
        <ActionButton
          offsetY={24}
          buttonColor='#F44336'>
          <ActionButton.Item buttonColor='#03a9f4'
            textContainerStyle={styles.actionButtonTextContainerStyle}
            textStyle={styles.actionButtonTextStyle}
            title='Take a photo' onPress={this._showCamera.bind(this)}>
            <Icon name='camera' style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#ff9800'
            textContainerStyle={styles.actionButtonTextContainerStyle}
            textStyle={styles.actionButtonTextStyle}
            title='Choose from library' onPress={this._showImageLibrary.bind(this)}>
            <Icon name='collections' style={styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>
      </View>
    )
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
    color: 'white'
  },
  actionButtonTextStyle: {
    fontSize: 16
  },
  actionButtonTextContainerStyle: {
    top: 11,
    height: 28
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F6F6F6'
  },
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC'
  },
  toolbar: {
    backgroundColor: '#e9eaed',
    height: 56
  },
  rowText: {
    flex: 1,
    fontSize: 20
  },
  searchInput: {
    fontSize: 20,
    padding: 15
  },
})

export default HomePage
