import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import React from 'react'
import styled from 'styled-components'

const StyledBoxWrapper = styled.div`
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
`
type CraftToolProps<E> = {
  as: React.ElementType<E>
  coverUrl: string
  canvas?: boolean
} & E
const CraftTool = <E extends object>({ as: CraftElement, coverUrl, canvas, ...elementProps }: CraftToolProps<E>) => {
  const { connectors } = useEditor()
  return (
    <StyledBoxWrapper
      className="mb-3"
      ref={ref =>
        ref &&
        connectors.create(
          ref,
          <Element id={CraftElement.toString()} is={CraftElement} canvas={canvas} {...(elementProps as E)} />,
        )
      }
    >
      <Image preview={false} src={coverUrl} />
    </StyledBoxWrapper>
  )
}

export default CraftTool
