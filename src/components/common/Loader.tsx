import { Spin } from 'antd'
import React from 'react'
import styled from 'styled-components'

const StyledSpinCenter = styled(Spin)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
`

const Loader = () => <StyledSpinCenter />
export default Loader
