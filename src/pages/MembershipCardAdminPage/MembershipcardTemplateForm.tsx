import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { BREAK_POINT } from 'lodestar-app-element/src/components/common/Responsive'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { MembershipCard } from '../../types/membershipCard'
import pageMessages from '../translation'
import MembershipCardPreviewModal from './MembershipCardPreviewModal'

type FieldProps = {
  template: string
}

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  @media (min-width: ${BREAK_POINT}px) {
    flex-direction: row;
  }
`

const StyledTextAreaWrapper = styled.div`
  max-width: 550px;
  margin-bottom: 10px;
  @media (min-width: ${BREAK_POINT}px) {
    flex: 7;
    max-width: 550px;
    margin-right: 10px;
    margin-bottom: 0;
  }
`

const StyledPreviewWrapper = styled.div`
  width: 100%;
  max-width: 460px;
  position: relative;
  height: 260px;
  margin-bottom: 20px;
  @media (min-width: ${BREAK_POINT}px) {
    flex: 3;
    max-width: 30%;
    margin-bottom: 0;
  }
`

const StyledFormItem = styled(Form.Item)`
  && {
    max-width: 550px;
    .ant-row {
      max-width: 550px;
    }
  }
  max-width: 550px;
`

const StyledButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
  @media (min-width: ${BREAK_POINT}px) {
    justify-content: flex-start;
  }
`

const MembershipCardTemplateForm: React.FC<{
  membershipCard: Pick<MembershipCard, 'id' | 'template'> | null
  onRefetch?: () => void
}> = ({ membershipCard, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [template, setTemplate] = useState<string>(membershipCard?.template || '')

  const [updateMembershipCardTemplate] = useMutation(UpdateMembershipCardTemplate)

  useEffect(() => {
    if (membershipCard) {
      form.setFieldsValue({ template: membershipCard.template })
      setTemplate(membershipCard.template)
    }
  }, [membershipCard, form])

  const handleTemplateChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTemplate = event.target.value
    form.setFieldsValue({ template: newTemplate })
    setTemplate(newTemplate)
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMembershipCardTemplate({
      variables: {
        membershipCardId: membershipCard?.id,
        template: values.template,
      },
    })
      .then(() => {
        message.success(formatMessage(pageMessages['*'].successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  if (!membershipCard) {
    return <Skeleton active />
  }

  return (
    <>
      <Form
        form={form}
        colon={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 20 } }}
        initialValues={{
          template: membershipCard.template,
        }}
        onFinish={handleSubmit}
      >
        <StyledFormWrapper>
          <StyledTextAreaWrapper>
            <StyledFormItem name="template" className="ant-row ant-form-item">
              <Input.TextArea rows={10} size="large" onChange={handleTemplateChange} />
            </StyledFormItem>
          </StyledTextAreaWrapper>
          <StyledPreviewWrapper>
            <MembershipCardPreviewModal template={template} />
          </StyledPreviewWrapper>
        </StyledFormWrapper>

        <StyledButtonWrapper>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(pageMessages['*'].cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(pageMessages['*'].save)}
          </Button>
        </StyledButtonWrapper>
      </Form>
    </>
  )
}

const UpdateMembershipCardTemplate = gql`
  mutation UpdateMembershipCardTemplate($membershipCardId: uuid!, $template: String) {
    update_card(_set: { template: $template }, where: { id: { _eq: $membershipCardId } }) {
      affected_rows
    }
  }
`

export default MembershipCardTemplateForm
