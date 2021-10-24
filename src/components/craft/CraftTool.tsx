import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { rgba } from 'lodestar-app-element/src/helpers'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'

const StyledBoxWrapper = styled.div`
  position: relative;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
`
const StyledText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme['@primary-color'] || '#000'};
  padding: 1rem 0;
`
const StyledOverlay = styled.div<{ coverUrl?: string }>`
  position: absolute;
  display: flex;
  opacity: 0%;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme['@primary-color'] || '#000'};
  &:hover {
    color: white;
    opacity: 100%;
    background-color: ${props => rgba(props.theme['@primary-color'] || '#000', 0.8)};
  }
`
type CraftToolProps<E> = {
  as: React.ElementType<E>
  message: { id: string; defaultMessage: string }
  coverUrl?: string
  canvas?: boolean
} & E
const CraftTool = <E extends object>({
  as: CraftElement,
  message,
  coverUrl,
  canvas,
  ...elementProps
}: CraftToolProps<E>) => {
  const { formatMessage } = useIntl()
  const { connectors } = useEditor()
  const theme = useAppTheme()
  const name = formatMessage(message)
  return (
    <StyledBoxWrapper
      className="mb-3"
      ref={ref =>
        ref &&
        connectors.create(ref, <Element id={message.id} is={CraftElement} canvas={canvas} {...(elementProps as E)} />)
      }
    >
      {coverUrl ? <Image preview={false} src={coverUrl} /> : <StyledText>{name}</StyledText>}
      {coverUrl && <StyledOverlay>{name}</StyledOverlay>}
    </StyledBoxWrapper>
  )
}

export default CraftTool
