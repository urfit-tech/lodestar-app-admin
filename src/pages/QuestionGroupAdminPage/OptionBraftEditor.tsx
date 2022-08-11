import BraftEditor from 'braft-editor'
import React, { useEffect, useState } from 'react'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'

const OptionBraftEditor: React.VFC<{
  optionId: string
  value: string
  onEditorChange: (optionId: string, value: string) => void
}> = ({ optionId, value, onEditorChange }) => {
  const [editorValue, setEditorValue] = useState<string>('')
  useEffect(() => {
    setEditorValue(BraftEditor.createEditorState(value))
  }, [value])
  return (
    <AdminBraftEditor
      variant="short"
      value={editorValue}
      onChange={v => setEditorValue(v.toHTML())}
      onBlur={() => onEditorChange(optionId, editorValue)}
    />
  )
}

export default OptionBraftEditor
