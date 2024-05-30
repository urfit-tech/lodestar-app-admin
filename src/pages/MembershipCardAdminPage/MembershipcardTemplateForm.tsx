import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { BREAK_POINT } from 'lodestar-app-element/src/components/common/Responsive'
import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
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
    max-width: calc(70% - 10px); // 添加這行
  }
`

const StyledIframeWrapper = styled.div`
  width: 100%;
  position: relative;
  height: 250px;
  @media (min-width: ${BREAK_POINT}px) {
    flex: 3;
    max-width: 30%; // 添加這行
  }
`

const StyledMembershipCard = styled.div<{ scale: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 400px;
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
      const formattedTemplate = prettier.format(membershipCard.template, {
        parser: 'html',
        plugins: [parserHtml],
        htmlWhitespaceSensitivity: 'ignore',
      })
      form.setFieldsValue({ template: formattedTemplate })
      updateIframeContent(formattedTemplate)
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
    const formattedTemplate = prettier.format(newTemplate, {
      parser: 'html',
      plugins: [parserHtml],
      htmlWhitespaceSensitivity: 'ignore',
    })
    form.setFieldsValue({ template: formattedTemplate })
    updateIframeContent(formattedTemplate)
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
