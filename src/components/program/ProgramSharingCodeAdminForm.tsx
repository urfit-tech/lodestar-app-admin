import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'

const StyledLabel = styled.div`
  font-size: 14px;
`
const StyledDeleteButton = styled(Button)`
  margin-top: 33px;
`

const ProgramSharingCodeAdminForm: React.FC<{
  programId: string
}> = ({ programId }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [loading, setLoading] = useState()

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        codes: [],
      }}
    >
      <Form.List name="codes">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <div key={field.key} className="d-flex justify-content-start mb-4">
                <Form.Item
                  name={[field.name, 'code']}
                  fieldKey={[field.fieldKey, 'code']}
                  label={<StyledLabel>{formatMessage(programMessages.label.code)}</StyledLabel>}
                  required
                  className="mb-0 mr-3"
                >
                  <Input style={{ width: '400px' }} />
                </Form.Item>
                <Form.Item
                  name={[field.name, 'note']}
                  fieldKey={[field.fieldKey, 'note']}
                  label={<StyledLabel>{formatMessage(programMessages.label.note)}</StyledLabel>}
                  className="mb-0 mr-3"
                >
                  <Input style={{ width: '220px' }} />
                </Form.Item>
                <StyledDeleteButton type="link" icon={<TrashOIcon />} onClick={() => remove(field.name)} />
              </div>
            ))}

            <Button type="link" icon={<PlusIcon />} className="mb-4" onClick={() => add()}>
              {formatMessage(programMessages.ui.addUrl)}
            </Button>
          </>
        )}
      </Form.List>

      <div>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </div>
    </Form>
  )
}

export default ProgramSharingCodeAdminForm
