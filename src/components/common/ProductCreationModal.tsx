import { FileAddOutlined } from '@ant-design/icons'
import { Button, Form, Input, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
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

type FieldProps = {
  title: string
  categoryIds: string[]
  creatorId?: string
  isSubscription?: boolean
  merchandiseType: 'general-physical' | 'general-virtual' | 'customized-physical' | 'customized-virtual'
}

const ProductCreationModal: React.FC<
  AdminModalProps & {
    customModalTitle?: string
    categoryClassType?: ClassType
    withCreatorSelector?: boolean
    withProgramType?: boolean
    withMerchandiseType?: boolean
    onCreate?: (values: {
      title: string
      categoryIds?: string[]
      creatorId?: string | null
      isSubscription?: boolean
      isPhysical?: boolean
      isCustomized?: boolean
    }) => Promise<any>
    allowedPermissions?: string[]
    creatorAppellation?: string
    customTitle?: string
    customTitleDefault?: string
  }
> = ({
  customModalTitle,
  categoryClassType,
  withCreatorSelector,
  withProgramType,
  withMerchandiseType,
  onCreate,
  allowedPermissions,
  creatorAppellation,
  customTitle,
  customTitleDefault,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { currentMemberId } = useAuth()
  const { enabledModules } = useApp()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form
      .validateFields()
      .then(() => {
        if (!onCreate) {
          return
        }
        const values = form.getFieldsValue()
        setLoading(true)
        onCreate({
          title: values.title || '',
          categoryIds: categoryClassType ? values.categoryIds || [] : [],
          creatorId: values.creatorId || currentMemberId,
          isSubscription: withProgramType ? values.isSubscription : undefined,
          isPhysical: withMerchandiseType ? values.merchandiseType.includes('physical') : undefined,
          isCustomized: withMerchandiseType ? values.merchandiseType.includes('customized') : undefined,
        }).finally(() => setLoading(false))
      })
      .catch(handleError)
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.create)}
        </Button>
      )}
      title={customModalTitle || formatMessage(commonMessages.ui.create)}
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
          merchandiseType: 'general-physical',
          title: customTitleDefault ? customTitleDefault : '',
        }}
      >
        {withCreatorSelector && (
          <Form.Item
            label={creatorAppellation || formatMessage(commonMessages.label.selectInstructor)}
            name="creatorId"
          >
            <ContentCreatorSelector allowedPermissions={allowedPermissions} />
          </Form.Item>
        )}
        <Form.Item
          label={customTitle || formatMessage(commonMessages.label.title)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.title),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        {categoryClassType && (
          <Form.Item label={formatMessage(commonMessages.label.category)} name="categoryIds">
            <CategorySelector classType={categoryClassType} />
          </Form.Item>
        )}
        {withMerchandiseType && (
          <Form.Item label={formatMessage(merchandiseMessages.label.merchandiseType)} name="merchandiseType">
            <Radio.Group>
              <Radio value="general-physical">
                <StyledLabel>{formatMessage(merchandiseMessages.label.generalPhysicalMerchandise)}</StyledLabel>
              </Radio>
              <StyledExample className="ml-4 mb-4">
                {formatMessage(merchandiseMessages.text.generalPhysicalMerchandise)}
              </StyledExample>
              {enabledModules.merchandise_virtualness && (
                <>
                  <Radio value="general-virtual">
                    <StyledLabel>{formatMessage(merchandiseMessages.label.generalVirtualMerchandise)}</StyledLabel>
                  </Radio>
                  <StyledExample className="ml-4 mb-4">
                    {formatMessage(merchandiseMessages.text.generalVirtualMerchandise)}
                  </StyledExample>
                </>
              )}
              {enabledModules.merchandise_customization && (
                <>
                  <Radio value="customized-physical">
                    <StyledLabel>{formatMessage(merchandiseMessages.label.customizedPhysicalMerchandise)}</StyledLabel>
                  </Radio>
                  <StyledExample className="ml-4 mb-4">
                    {formatMessage(merchandiseMessages.text.customizedPhysicalMerchandise)}
                  </StyledExample>
                </>
              )}
              {enabledModules.merchandise_virtualness && enabledModules.merchandise_customization && (
                <>
                  <Radio value="customized-virtual">
                    <StyledLabel>{formatMessage(merchandiseMessages.label.customizedVirtualMerchandise)}</StyledLabel>
                  </Radio>
                  <StyledExample className="ml-4">
                    {formatMessage(merchandiseMessages.text.customizedVirtualMerchandise)}
                  </StyledExample>
                </>
              )}
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
    </AdminModal>
  )
}

export default ProductCreationModal
