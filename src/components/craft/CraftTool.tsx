import { Element, useEditor, UserComponent } from '@craftjs/core'
import { Image } from 'antd'
import { PropsWithCraft } from 'lodestar-app-element/src/components/common/Craftize'
import { rgba } from 'lodestar-app-element/src/helpers'
import React from 'react'
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
type CraftToolProps<P> = {
  as: UserComponent<PropsWithCraft<P>>
  coverUrl?: string
  canvas?: boolean
  displayName?: string
} & Element<UserComponent<PropsWithCraft<P>>>

const CraftTool = <P extends object>({
  as: CraftElement,
  coverUrl,
  displayName,
  ...elementProps
}: CraftToolProps<P>) => {
  const { connectors } = useEditor()

  return (
    <StyledBoxWrapper
      className="mb-3"
      ref={ref =>
        ref &&
        connectors.create(
          ref,
          <Element is={CraftElement} {...(elementProps as Element<UserComponent<PropsWithCraft<P>>>)} />,
        )
      }
    >
      {coverUrl ? (
        <Image preview={false} src={coverUrl} />
      ) : (
        <StyledText>{displayName || CraftElement.craft?.displayName}</StyledText>
      )}
      {coverUrl && <StyledOverlay>{CraftElement.craft?.displayName}</StyledOverlay>}
    </StyledBoxWrapper>
  )
}

export default CraftTool
