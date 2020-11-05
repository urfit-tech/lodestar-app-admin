import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import types from '../../types'

const StyledLabel = styled.div`
  font-size: 14px;
`
const StyledDeleteButton = styled(Button)`
  margin-top: 33px;
`
const StyledDescription = styled.div`
  width: 100%;
  color: var(--gray-dark);
  font-size: 14px;
`

type SharingCodeProps = {
  id: string
  path: string
  code: string
  note: string | null
}
type FieldProps = {
  sharingCodes: {
    code: string
    note: string
  }[]
}

const ProgramSharingCodeAdminForm: React.FC<{
  programId: string
}> = ({ programId }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId, settings } = useContext(AppContext)
  const pathKey = `/programs/${programId}`
  const { loadingSharingCodes, sharingCodes } = useSharingCodeCollection(pathKey)
  const [insertSharingCode] = useMutation<types.INSERT_SHARING_CODE, types.INSERT_SHARING_CODEVariables>(
    INSERT_SHARING_CODE,
  )
  const [sharingCodeInputs, setSharingCodeInputs] = useState<FieldProps['sharingCodes']>([])
  const [loading, setLoading] = useState(false)

  if (loadingSharingCodes) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    insertSharingCode({
      variables: {
        path: pathKey,
        sharingCodes: values.sharingCodes
          .filter(sharingCode => sharingCode.code)
          .map(sharingCode => ({
            app_id: appId,
            path: pathKey,
            code: sharingCode.code.trim().replace(/ +/g, '-'),
            note: sharingCode.note,
          })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        sharingCodes: sharingCodes,
      }}
      onValuesChange={(_, values) => {
        setSharingCodeInputs(
          values.sharingCodes.map(sharingCode => ({
            code: sharingCode?.code.trim().replace(/ +/g, '-') || '',
            note: sharingCode?.note || '',
          })),
        )
      }}
      onFinish={handleSubmit}
    >
      <Form.List name="sharingCodes">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <div key={field.key} className="d-flex justify-content-start flex-wrap mb-4">
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
                <StyledDescription className="mt-1">
                  {settings['host']}/programs/{programId}?sharing=
                  {sharingCodeInputs[index]?.code || sharingCodes[index]?.code}
                </StyledDescription>
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

const useSharingCodeCollection = (path: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_SHARING_CODE_COLLECTION,
    types.GET_SHARING_CODE_COLLECTIONVariables
  >(
    gql`
      query GET_SHARING_CODE_COLLECTION($path: String!) {
        sharing_code(where: { path: { _eq: $path } }, order_by: { created_at: asc }) {
          id
          path
          code
          note
        }
      }
    `,
    { variables: { path } },
  )

  const sharingCodes: SharingCodeProps[] =
    data?.sharing_code.map(v => ({
      id: v.id,
      path: v.path,
      code: v.code,
      note: v.note,
    })) || []

  return {
    loadingSharingCodes: loading,
    errorSharingCodes: error,
    sharingCodes,
    refetchSharingCodes: refetch,
  }
}

const INSERT_SHARING_CODE = gql`
  mutation INSERT_SHARING_CODE($path: String!, $sharingCodes: [sharing_code_insert_input!]!) {
    delete_sharing_code(where: { path: { _eq: $path } }) {
      affected_rows
    }
    insert_sharing_code(objects: $sharingCodes) {
      affected_rows
    }
  }
`

export default ProgramSharingCodeAdminForm
