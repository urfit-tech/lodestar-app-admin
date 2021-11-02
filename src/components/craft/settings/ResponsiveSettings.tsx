import { useEditor } from '@craftjs/core'
import { mergeDeepRight } from 'ramda'
import { CraftElementSettings } from '../../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'

export const withResponsive = (Settings: CraftElementSettings) => {
  const ResponsiveSettings: React.FC = () => {
    const editor = useEditor(state => ({
      currentNode: state.events.selected ? state.nodes[state.events.selected] : null,
    }))
    if (!editor.currentNode) {
      return <div>Please select an element.</div>
    }
    const { responsive, ...currentProps } = editor.currentNode?.data.props || {}
    switch (editor.currentNode?.data.custom?.responsive) {
      case 'mobile':
        return (
          <Settings
            props={mergeDeepRight(currentProps, responsive?.mobile || {})}
            onPropsChange={changedProps =>
              editor.currentNode &&
              editor.actions.history.throttle().setProp(editor.currentNode.id, proxy => {
                for (const key in changedProps) {
                  proxy[key] = changedProps[key as keyof typeof changedProps]
                }
                proxy.responsive = {
                  ...proxy.responsive,
                  mobile: mergeDeepRight(proxy.responsive?.mobile, changedProps),
                }
              })
            }
          />
        )
      case 'tablet':
        return (
          <Settings
            props={mergeDeepRight(currentProps, responsive?.tablet || {})}
            onPropsChange={changedProps =>
              editor.currentNode &&
              editor.actions.history.throttle().setProp(editor.currentNode.id, proxy => {
                for (const key in changedProps) {
                  proxy[key] = changedProps[key as keyof typeof changedProps]
                }
                proxy.responsive = {
                  ...proxy.responsive,
                  tablet: mergeDeepRight(proxy.responsive?.tablet, changedProps),
                }
              })
            }
          />
        )
      default:
        return (
          <Settings
            props={mergeDeepRight(currentProps, responsive?.desktop || {})}
            onPropsChange={changedProps =>
              editor.currentNode &&
              editor.actions.history.throttle().setProp(editor.currentNode.id, proxy => {
                for (const key in changedProps) {
                  proxy[key] = changedProps[key as keyof typeof changedProps]
                }
                proxy.responsive = {
                  ...proxy.responsive,
                  desktop: mergeDeepRight(proxy.responsive?.desktop, changedProps),
                }
              })
            }
          />
        )
    }
  }
  return ResponsiveSettings
}
