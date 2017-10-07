import React, {Component} from 'react'

type Props = {
  value: string,
  raised: boolean,
  theme: string,
  color: string,
  onPress: () => void
}

declare class Button extends Component<Props, State> {}

export default Button
