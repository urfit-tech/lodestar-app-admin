import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { countBy } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../../hasura'
import { copyToClipboard, handleError } from '../../../helpers'
import { ReactComponent as PlusIcon } from '../../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../../images/icon/trash-o.svg'
import commonMessages from '../translation'

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
    isDuplicated?: boolean
  }[]
}

const SharingCodeAdminForm: React.FC<{
  typePath: string
  target: string
}> = ({ typePath, target }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId, host } = useApp()
  const pathKey = `/${typePath}/${target}`
  const { loadingSharingCodes, sharingCodes, refetchSharingCodes } = useSharingCodeCollection(pathKey)
  const [insertSharingCode] = useMutation<hasura.INSERT_SHARING_CODE, hasura.INSERT_SHARING_CODEVariables>(
    INSERT_SHARING_CODE,
  )
  const [sharingCodeInputs, setSharingCodeInputs] = useState<FieldProps['sharingCodes']>([])
  const [loading, setLoading] = useState(false)

  if (loadingSharingCodes) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    if (sharingCodeInputs.some(input => input.isDuplicated)) {
      return
    }
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
            note: sharingCode.note || '',
          })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages['*'].successfullySaved))
        refetchSharingCodes()
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
        const sharingCodeCounts = countBy((v: string) => v)(values.sharingCodes.map(v => v.code))
        setSharingCodeInputs(
          values.sharingCodes.map(sharingCode => {
            const code = sharingCode?.code.trim().replace(/ +/g, '-') || ''
            return {
              code,
              note: sharingCode?.note || '',
              isDuplicated: sharingCodeCounts[code] > 1,
            }
          }),
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
                  label={<StyledLabel>{formatMessage(commonMessages.SharingCode.code)}</StyledLabel>}
                  className="mb-0 mr-3"
                  rules={[
                    {
                      required: true,
                      message: formatMessage(commonMessages.SharingCode.codeIsRequired),
                    },
                  ]}
                  validateStatus={sharingCodeInputs[index]?.isDuplicated ? 'error' : undefined}
                  help={
                    sharingCodeInputs[index]?.code && sharingCodeInputs[index]?.isDuplicated
                      ? formatMessage(commonMessages.SharingCode.codeDuplicated)
                      : undefined
                  }
                >
                  <Input style={{ width: '400px' }} />
                </Form.Item>
                <Form.Item
                  name={[field.name, 'note']}
                  fieldKey={[field.fieldKey, 'note']}
                  label={<StyledLabel>{formatMessage(commonMessages.SharingCode.note)}</StyledLabel>}
                  className="mb-0 mr-3"
                >
                  <Input style={{ width: '220px' }} />
                </Form.Item>
                <StyledDeleteButton type="link" icon={<TrashOIcon />} onClick={() => remove(field.name)} />
                <StyledDescription className="mt-1">
                  <span>
                    https://{host}/{typePath}/{target}?sharing=
                    {sharingCodeInputs[index]?.code || sharingCodes[index]?.code}
                  </span>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      copyToClipboard(
                        `https://${host}/${typePath}/${target}?sharing=${
                          sharingCodeInputs[index]?.code || sharingCodes[index]?.code
                        }`,
                      )
                      message.success(formatMessage(commonMessages.SharingCode.copiedToClipboard))
                    }}
                  >
                    {formatMessage(commonMessages.SharingCode.copy)}
                  </Button>
                </StyledDescription>
              </div>
            ))}

            <Button
              type="link"
              icon={<PlusIcon />}
              className="mb-4 align-items-center"
              onClick={() =>
                add({
                  code: '',
                  note: '',
                })
              }
            >
              {formatMessage(commonMessages.SharingCode.addUrl)}
            </Button>
          </>
        )}
      </Form.List>

      <div>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages['*'].cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages['*'].save)}
        </Button>
      </div>
    </Form>
  )
}

const useSharingCodeCollection = (path: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_SHARING_CODE_COLLECTION,
    hasura.GET_SHARING_CODE_COLLECTIONVariables
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
      note: v.note || '',
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

export default SharingCodeAdminForm
