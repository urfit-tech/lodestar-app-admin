import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { BREAK_POINT } from 'lodestar-app-element/src/components/common/Responsive'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { MembershipCard } from '../../types/membershipCard'
import pageMessages from '../translation'

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
  width: 100%;
  margin-bottom: 10px;
  @media (min-width: ${BREAK_POINT}px) {
    flex: 7;
    margin-right: 10px;
    margin-bottom: 0;
    max-width: calc(70% - 10px);
  }
`

const StyledIframeWrapper = styled.div`
  width: 460px;
  position: relative;
  height: 260px;
  @media (min-width: ${BREAK_POINT}px) {
    flex: 3;
    max-width: 30%;
  }
`

const StyledMembershipCard = styled.div<{ scale: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 260px;
  width: 460px;
  overflow: hidden;
  white-space: nowrap;
  transform: scale(${props => props.scale});
  transform-origin: top left;
  @media (min-width: 768px) {
    width: 400px;
  }
`

const CertificateIntroForm: React.FC<{
  membershipCard: Pick<MembershipCard, 'id' | 'template'> | null
  onRefetch?: () => void
}> = ({ membershipCard, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [UpdateMembseshipCardTemplateMutation] = useMutation(UpdateMembseshipCardTemplate)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (membershipCard) {
      form.setFieldsValue({ template: membershipCard.template })
      updateIframeContent(membershipCard.template)
    }
  }, [membershipCard, form])

  const updateIframeContent = (template: string) => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(template || '')
        iframeDoc.close()
      }
    }
  }

  useEffect(() => {
    if (membershipCard) {
      updateIframeContent(membershipCard.template)
    }
  }, [membershipCard])

  const handleTemplateChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTemplate = event.target.value
    form.setFieldsValue({ template: newTemplate })
    updateIframeContent(newTemplate)
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    UpdateMembseshipCardTemplateMutation({
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
            <Form.Item name="template" className="ant-row ant-form-item">
              <Input.TextArea rows={10} size="large" onChange={handleTemplateChange} />
            </Form.Item>
          </StyledTextAreaWrapper>
          <StyledIframeWrapper>
            <StyledMembershipCard scale={0.75}>
              <iframe ref={iframeRef} title="Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
            </StyledMembershipCard>
          </StyledIframeWrapper>
        </StyledFormWrapper>

        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(pageMessages['*'].cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(pageMessages['*'].save)}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

const UpdateMembseshipCardTemplate = gql`
  mutation UpdateMembershipCardTemplate($membershipCardId: uuid!, $template: String) {
    update_card(_set: { template: $template }, where: { id: { _eq: $membershipCardId } }) {
      affected_rows
    }
  }
`

export default CertificateIntroForm
