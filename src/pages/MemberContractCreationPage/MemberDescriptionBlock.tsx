import { useMutation } from '@apollo/client'
import { Alert, Button, Descriptions, Form, Input, message, Select, Tag, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { handleError, notEmpty } from 'lodestar-app-element/src/helpers'
import { length } from 'ramda'
import React, { Fragment, memo, useState } from 'react'
import { useIntl } from 'react-intl'
import { ContractInfo } from '.'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { useMutateMemberProperty } from '../../hooks/member'

type FieldProps = {
  [propertyId: string]: string
}

const MemberDescriptionBlock: React.FC<{
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  member: NonNullable<ContractInfo['member']>
  properties: ContractInfo['properties']
}> = memo(
  ({ memberBlockRef, member, properties }) => {
    const { formatMessage } = useIntl()
    const [form] = useForm<FieldProps>()
    const [loading, setLoading] = useState(false)
    const { updateMemberProperty } = useMutateMemberProperty()
    const [updateMemberBasicInfo] = useMutation<
      hasura.UPDATE_MEMBER_BASIC_INFO,
      hasura.UPDATE_MEMBER_BASIC_INFOVariables
    >(UPDATE_MEMBER_BASIC_INFO)

    const handleChange = (value: Partial<ContractInfo['member']>) => {
      const updated = { ...member, ...value }
      updateMemberBasicInfo({ variables: { memberId: member.id, name: updated?.name, email: updated?.email } })
        .then(() => window.location.reload())
        .catch(handleError)
    }

    const handleSubmit = (values: FieldProps) => {
      setLoading(true)
      updateMemberProperty({
        variables: {
          memberProperties: properties
            .map(property =>
              values[property.id]
                ? {
                    member_id: member.id,
                    property_id: property.id,
                    value: values[property.id],
                  }
                : member.properties.find(memberProperty => memberProperty.propertyId === property.id)
                ? {
                    member_id: member.id,
                    property_id: property.id,
                    value: member.properties.find(memberProperty => memberProperty.propertyId === property.id)?.value,
                  }
                : null,
            )
            .filter(notEmpty),
        },
      })
        .then(() => {
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .then(() => window.location.reload())
        .catch(handleError)
        .finally(() => setLoading(false))
    }

    return (
      <div ref={memberBlockRef}>
        <Descriptions title="學生資料" bordered className="mb-3">
          <Descriptions.Item label="學員稱呼">
            <Typography.Text editable={{ onChange: v => handleChange({ name: v }) }}>{member.name}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="學員信箱">
            <Typography.Text editable={{ onChange: v => handleChange({ email: v }) }}>{member.email}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="學員電話">
            {!!length(member.phones) ? (
              member.phones.map((v, index) => <Tag key={index}>{v}</Tag>)
            ) : (
              <Alert type="error" message="未設定" />
            )}
          </Descriptions.Item>
        </Descriptions>
        <Form
          form={form}
          colon={false}
          hideRequiredMark
          labelCol={{ span: 4 }}
          initialValues={member.properties.reduce(
            (accumulator, currentValue) => ({
              ...accumulator,
              [currentValue.propertyId]: currentValue.value,
            }),
            {},
          )}
          onFinish={handleSubmit}
        >
          {properties.map(property => (
            <Fragment key={property.id}>
              <Form.Item label={property.name} name={property.id}>
                {property?.placeholder?.includes('/') ? (
                  <Select>
                    {property?.placeholder?.split('/').map((value: string, idx: number) => (
                      <Select.Option key={idx} value={value}>
                        {value}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Input />
                )}
              </Form.Item>
              <div
                hidden
                className={
                  member.properties.find(memberProperty => memberProperty.propertyId === property.id) ? '' : 'ant-alert'
                }
              ></div>
            </Fragment>
          ))}
          <Form.Item wrapperCol={{ md: { offset: 4 } }}>
            <Button className="mr-2" onClick={() => form.resetFields()}>
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.member.id === nextProps.member.id,
)
const UPDATE_MEMBER_BASIC_INFO = gql`
  mutation UPDATE_MEMBER_BASIC_INFO($memberId: String!, $name: String, $email: String) {
    update_member(where: { id: { _eq: $memberId } }, _set: { name: $name, email: $email }) {
      affected_rows
    }
  }
`

export default MemberDescriptionBlock
