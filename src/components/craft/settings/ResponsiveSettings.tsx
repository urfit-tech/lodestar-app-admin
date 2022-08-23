import { useEditor } from '@craftjs/core'
import { mergeDeepRight } from 'ramda'
import { useContext } from 'react'
import CraftPageBuilderContext from '../../../pages/CraftPageAdminPage/CraftPageBuilderContext'
import { CraftElementSettings } from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'

export const withResponsive = (Settings: CraftElementSettings) => {
  const ResponsiveSettings: React.FC = () => {
    const { device } = useContext(CraftPageBuilderContext)
    const editor = useEditor(state => ({
      currentNode: state.events.selected ? state.nodes[state.events.selected] : null,
    }))
    if (!editor.currentNode) {
      return <div>Please select an element.</div>
    }
    const { responsive, ...currentProps } = editor.currentNode?.data.props || {}
    return (
      <Settings
        props={mergeDeepRight(currentProps, responsive?.[device] || {})}
        onPropsChange={changedProps =>
          editor.currentNode &&
          editor.actions.history.throttle().setProp(editor.currentNode.id, proxy => {
            for (const key in changedProps) {
              proxy[key] = changedProps[key as keyof typeof changedProps]
            }
            proxy.responsive = {
              ...proxy.responsive,
              [device]: mergeDeepRight(proxy.responsive?.[device], changedProps),
            }
          })
        }
      />
    )
  }
  return ResponsiveSettings
}
