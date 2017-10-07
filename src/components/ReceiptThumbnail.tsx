import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageURISource
} from 'react-native'

type Props = {
  onPress: () => void,
  source: ImageURISource,
  width: number,
  height: number
}

const receiptThumbnail: StatelessComponent<Props> = (props) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={props.onPress}>
      <Image
        source={props.source}
        style={{
          width: props.width,
          height: props.height
        }} />
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 15
  }
})

export default receiptThumbnail
