import { Collapse, Input, Slider } from 'antd'
import styled from 'styled-components'

export const AdminHeaderTitle = styled.div`
  flex-grow: 1;
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const CraftSettingLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  font-weight: 500;
`
export const CraftSlider = styled(Slider)`
  .ant-slider-track {
    background-color: ${props => props.theme['@primary-color'] || '#4c5b8f'};
  }
`
export const StyledCollapsePanel = styled(Collapse.Panel)`
  .ant-collapse-header {
    padding-left: 0px !important;
  }
  .ant-collapse-content-box {
    padding: 0px !important;
  }
`
export const StyledSettingButtonWrapper = styled.div`
  position: absolute;
  top: 0.5em;
  right: 0.5em;
`
export const StyledUnderLineInput = styled(Input)`
  border-color: #d8d8d8;
  border-style: solid;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 1px;
  border-left-width: 0px;
  :hover {
    border-right-width: 0px !important;
    border-color: #d8d8d8;
  }
`
export const StyledCraftSettingLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  font-weight: 500;
`

export { default as ActivitySettings } from './ActivitySettings'
export { default as BackgroundSettings } from './BackgroundSettings'
export { default as ButtonSettings } from './ButtonSettings'
export { default as CardSettings } from './CardSettings'
export { default as CarouselContainerSettings } from './CarouselContainerSettings'
export { default as CarouselSettings } from './CarouselSettings'
export { default as CollapseSettings } from './CollapseSettings'
export { default as ContainerSettings } from './ContainerSettings'
export { default as CreatorSettings } from './CreatorSettings'
export { default as ImageSettings } from './ImageSettings'
export { default as InstructorSettings } from './InstructorSettings'
export { default as LayoutSettings } from './LayoutSettings'
export { default as ParagraphSettings } from './ParagraphSettings'
export { default as PodcastProgramSettings } from './PodcastProgramSettings'
export { default as ProgramSettings } from './ProgramSettings'
export { default as ProjectSettings } from './ProjectSettings'
export { default as StatisticsSettings } from './StatisticsSettings'
export { default as TitleAndParagraphSettings } from './TitleAndParagraphSettings'
export { default as TitleSettings } from './TitleSettings'
