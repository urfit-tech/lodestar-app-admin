import { useEditor } from '@craftjs/core'
import { Tag } from 'antd'
import { defineMessages, useIntl } from 'react-intl'

const messages = defineMessages({
  desktop: { id: 'craft.settings.responsiveSelector.desktop', defaultMessage: '桌面版' },
  tablet: { id: 'craft.settings.responsiveSelector.tablet', defaultMessage: '平板' },
  mobile: { id: 'craft.settings.responsiveSelector.mobile', defaultMessage: '手機版' },
})
type ResponsiveOption = 'desktop' | 'tablet' | 'mobile'
const CraftResponsiveSelector: React.FC = () => {
  const { formatMessage } = useIntl()
  const editor = useEditor((state, query) => ({
    selectedNode: state.events.selected ? query.node(state.events.selected).get() : null,
  }))
  const responsiveOption = (editor.selectedNode?.data.custom?.responsive || 'desktop') as ResponsiveOption
  const changeResponsiveOption = (option: ResponsiveOption) => {
    editor.selectedNode &&
      editor.actions.setCustom(editor.selectedNode.id, custom => {
        custom.responsive = option
      })
  }
  return (
    <div className="d-flex align-items-center px-3" style={{ height: '40px', backgroundColor: 'var(--gray-light)' }}>
      <Tag.CheckableTag
        className="mr-1"
        checked={responsiveOption === 'desktop'}
        onClick={() => changeResponsiveOption('desktop')}
      >
        {formatMessage(messages.desktop)}
      </Tag.CheckableTag>
      <Tag.CheckableTag
        className="mr-1"
        checked={responsiveOption === 'tablet'}
        onClick={() => changeResponsiveOption('tablet')}
      >
        {formatMessage(messages.tablet)}
      </Tag.CheckableTag>
      <Tag.CheckableTag checked={responsiveOption === 'mobile'} onClick={() => changeResponsiveOption('mobile')}>
        {formatMessage(messages.mobile)}
      </Tag.CheckableTag>
    </div>
  )
}

export default CraftResponsiveSelector
