import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  Alert
} from 'react-native'

import { Receipt } from '../services/Api'
import { ReceiptImage, Thumbnail } from '../types'
import ReceiptThumbnail from '../components/ReceiptThumbnail'
import ImagePlaceholder from '../components/ImagePlaceholder'
import ReceiptDetails from '../components/ReceiptDetails'
import Spinner from '../components/Spinner'
import Swiper from '../components/Swiper'
import Icon from 'react-native-vector-icons/MaterialIcons'

type Props = {
  receipt: Receipt,
  nextReceipt?: Receipt,
  prevReceipt?: Receipt,
  image: ReceiptImage,
  thumbnail: Thumbnail,
  error?: string,
  isDeleting: boolean,

  onDelete: (receiptId: string) => void,
  onClose: () => void,
  onEdit: () => void,
  toReceipt: (receipt: Receipt) => void,
  toImageViewer: () => void
}

const receiptViewPage: StatelessComponent<Props> = (props) => {

  const onActionSelected = (position) => {
    if (position === 0) {
      props.onEdit()
    } else if (position === 1) {
      Alert.alert('Delete Receipt',
        'Are you sure you want to delete this receipt?',
        [
          { text: 'Cancel', onPress: () => console.log('Cancel Pressed!') },
          { text: 'OK', onPress: () => props.onDelete(props.receipt.id) }
        ])
    }
  }

  const renderThumbnail = () => {
    return (
      <ReceiptThumbnail
        onPress={props.toImageViewer}
        source={props.image.source}
        width={props.thumbnail.width}
        height={props.thumbnail.height}
      />
    )
  }

  const renderPlaceholder = () => {
    return (
      <ImagePlaceholder
        width={props.thumbnail.width}
        height={props.thumbnail.height}
      />
    )
  }

  const onLeftSwipe = () => {
    if (props.nextReceipt) {
      props.toReceipt(props.nextReceipt)
    }
  }

  const onRightSwipe = () => {
    if (props.prevReceipt) {
      props.toReceipt(props.prevReceipt)
    }
  }

  let thumbnail = props.image.source !== undefined ?
    renderThumbnail() : renderPlaceholder()

  return (
    <View style={styles.container}>
      <Icon.ToolbarAndroid
        style={styles.toolbar}
        title='Receipt'
        navIconName='close'
        actions={[
          { title: 'Edit', show: 'always' },
          { title: 'Delete', show: 'never' }]}
        onIconClicked={props.onClose}
        onActionSelected={(position) => onActionSelected(position)} />
      <Swiper
        onLeftSwipe={onLeftSwipe}
        onRightSwipe={onRightSwipe}>
        {thumbnail}
        <ReceiptDetails receipt={props.receipt} />
        <Spinner message='Deleting receipt ...' visible={props.isDeleting} />
      </Swiper>
    </View>

  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toolbar: {
    backgroundColor: '#e9eaed',
    height: 56
  }
})

export default receiptViewPage
