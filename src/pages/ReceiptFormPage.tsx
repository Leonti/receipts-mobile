import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Alert
} from 'react-native'

import { ReceiptImage } from '../types'
import ReceiptThumbnail from '../components/ReceiptThumbnail'
import ReceiptForm from '../components/ReceiptForm'
import Spinner from '../components/Spinner'
import ImagePlaceholder from '../components/ImagePlaceholder'
import Swiper from '../components/Swiper'
import Icon from 'react-native-vector-icons/MaterialIcons'

function formatTotal(total): string {
  return total !== null && total !== undefined ? total.toString() : undefined
}

function formatTags(tags): string[] {
  return tags ? tags : []
}

function formatTransactionTime(transactionTime) {
  return transactionTime ? transactionTime : new Date().getTime()
}

type FormData = {
  total: any,
  description: string,
  transactionTime: number,
  tags: string[]
}

type Props = {
  receiptId?: string,
  isFetching: boolean,
  isDeleting: boolean,
  nextReceipt: any,
  prevReceipt: any,
  isSwipable: boolean,
  image: ReceiptImage,
  description: string,
  total: number, // optional
  transactionTime: number, // optional
  tags: string[],
  title: string,
  thumbnail: {
    width: number,
    height: number
  },

  onSave: (receiptId: string, imageUri: string, formData: FormData) => void,
  onModifiedReceipt: (updatedData: object) => void,
  onClose: () => void,
  onDelete: (receiptId: string) => void,
  toReceipt?: (receiptId: string) => void,
  toImageViewer: () => void
}

const receiptFormPage: StatelessComponent<Props> = (props) => {

  const onActionSelected = (position: Number) => {
    if (position === 0) {
      props.onSave(props.receiptId, props.image.source.uri, {
        total: props.total,
        description: props.description,
        transactionTime: props.transactionTime,
        tags: props.tags
      })
    } else if (position === 1) {
      Alert.alert('Delete Receipt',
        'Are you sure you want to delete this receipt?',
        [
          { text: 'Cancel', onPress: () => console.log('Cancel Pressed!') },
          { text: 'OK', onPress: () => props.onDelete(props.receiptId) }
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

  const renderForm = () => {
    let thumbnail = props.image.source !== undefined ?
      renderThumbnail() : renderPlaceholder()

    return (
      <View>
        <ScrollView>
          {thumbnail}
          <ReceiptForm
            total={formatTotal(props.total)}
            onTotalChange={(text) => {
              props.onModifiedReceipt({
                total: text
              })
            }}
            description={props.description}
            onDescriptionChange={(text) => {
              props.onModifiedReceipt({
                description: text
              })
            }}
            transactionTime={formatTransactionTime(props.transactionTime)}
            onTransactionTimeChange={transactionTime => {
              props.onModifiedReceipt({ transactionTime })
            }}
            tags={formatTags(props.tags)}
            onTagsChange={tags => {
              props.onModifiedReceipt({
                tags: tags
              })
            }}
          />
        </ScrollView>
        <Spinner message='Saving receipt ...' visible={props.isFetching} />
        <Spinner message='Deleting receipt ...' visible={props.isDeleting} />
      </View>
    )
  }

  let form = props.isSwipable ?
    <Swiper
      onLeftSwipe={onLeftSwipe}
      onRightSwipe={onRightSwipe}>
      {renderForm()}
    </Swiper> :
    renderForm()

  return (
    <View style={styles.container}>
      <Icon.ToolbarAndroid
        style={styles.toolbar}
        title={props.title}
        navIconName='close'
        actions={[
          { title: 'Save', show: 'always' },
          { title: 'Delete', show: 'never' }
        ]}
        onIconClicked={props.onClose}
        onActionSelected={onActionSelected} />
      {form}
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

export default receiptFormPage
