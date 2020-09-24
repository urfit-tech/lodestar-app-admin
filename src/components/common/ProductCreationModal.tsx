import { FileAddOutlined } from '@ant-design/icons'
import { Button, Form, Input, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages, programMessages } from '../../helpers/translation'
import { ClassType } from '../../types/general'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import CategorySelector from '../form/CategorySelector'
import ContentCreatorSelector from '../form/ContentCreatorSelector'

const StyledLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const StyledExample = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

const ProductCreationModal: React.FC<
  AdminModalProps & {
    classType?: ClassType
    withCreatorSelector?: boolean
    withCategorySelector?: boolean
    withProgramType?: boolean
    withMerchandiseType?: boolean
    onCreate?: (values: {
      title: string
      categoryIds: string[]
      creatorId?: string | null
      isSubscription?: boolean
      isPhysical?: boolean
    }) => Promise<any>
  }
> = ({
  classType,
  withCreatorSelector,
  withCategorySelector,
  withProgramType,
  withMerchandiseType,
  onCreate,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { currentMemberId } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values: any) => {
        if (!onCreate) {
          return
        }
        setLoading(true)
        onCreate({
          title: values.title,
          categoryIds: values.categoryIds || [],
          creatorId: values.creatorId || currentMemberId,
          isSubscription: withProgramType ? values.isSubscription : undefined,
          isPhysical: withMerchandiseType && values.isPhysical,
        })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.create)}
        </Button>
      )}
      icon={<FileAddOutlined />}
      title={formatMessage(commonMessages.ui.create)}
      cancelText={formatMessage(commonMessages.ui.cancel)}
      okText={formatMessage(commonMessages.ui.create)}
      okButtonProps={{ loading }}
      onOk={() => handleSubmit()}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          memberId: currentMemberId,
          isSubscription: false,
          isPhysical: true,
        }}
      >
        {withCreatorSelector && (
          <Form.Item label={formatMessage(commonMessages.label.selectInstructor)} name="creatorId">
            <ContentCreatorSelector />
          </Form.Item>
        )}
        <Form.Item
          label={formatMessage(commonMessages.term.title)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.title),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        {withCategorySelector && classType && (
          <Form.Item label={formatMessage(commonMessages.term.category)} name="categoryIds">
            <CategorySelector classType={classType} />
          </Form.Item>
        )}
        {withProgramType && (
          <Form.Item label={formatMessage(programMessages.label.programPlanType)} name="isSubscription">
            <Radio.Group
              options={[
                { label: formatMessage(programMessages.label.perpetualPlanType), value: false },
                { label: formatMessage(programMessages.label.subscriptionPlanType), value: true },
              ]}
            />
          </Form.Item>
        )}
        {withMerchandiseType && (
          <Form.Item label={formatMessage(merchandiseMessages.label.merchandiseType)} name="isPhysical">
            <Radio.Group>
              <Radio value={true}>
                <StyledLabel>{formatMessage(merchandiseMessages.label.generalPhysicalMerchandise)}</StyledLabel>
              </Radio>
              <StyledExample className="ml-4 mb-4">
                {formatMessage(merchandiseMessages.text.generalPhysicalMerchandise)}
              </StyledExample>
              <Radio value={false}>
                <StyledLabel>{formatMessage(merchandiseMessages.label.generalVirtualMerchandise)}</StyledLabel>
              </Radio>
              <StyledExample className="ml-4">
                {formatMessage(merchandiseMessages.text.generalVirtualMerchandise)}
              </StyledExample>
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
    </AdminModal>
  )
}

export default ProductCreationModal
