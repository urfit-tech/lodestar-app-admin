import { Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import CertificateContentCard from 'lodestar-app-element/src/components/cards/CertificateContentCard'
import CertificateImageCard from 'lodestar-app-element/src/components/cards/CertificateImageCard'
import { MemberCertificate } from 'lodestar-app-element/src/types/certificate'
import moment from 'moment'
import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Certificate } from '../../types/certificate'
import pageMessages from '../translation'

const StyledModal = styled(Modal)`
  color: ${props => props.theme['@normal-color']};
  .ant-modal-header {
    border-bottom: 0px solid #e8e8e8;
    padding: 24px 24px;
  }
  .ant-modal-title {
    font-weight: bold;
  }
  .ant-modal-body {
    font-size: 14px;
    line-height: 1.57;
    letter-spacing: 0.18px;
    color: var(--gray-darker);
  }
  .ant-modal-close-x {
    color: #9b9b9b;
  }
`

const CertificatePreviewModal: React.VFC<
  ModalProps & {
    certificate: Certificate
  }
> = ({ certificate, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const memberCertificate: MemberCertificate = {
    id: '0',
    number: 'DEMO000000',
    values: [],
    expiredAt: null,
    deliveredAt: new Date(),
    memberId: 'demo-id',
    certificate: {
      id: certificate.id,
      title: certificate.title || '',
      description: certificate.description || '',
      code: certificate.code,
      template: certificate.certificateTemplate.template,
      templateImage: certificate.certificateTemplate.backgroundImage,
      qualification: certificate.qualification || '-',
      periodType: certificate.periodType,
      periodAmount: certificate.periodAmount?.toString() || '-',
      createdAt: new Date(),
    },
  }

  const defaultTemplateVars = {
    name: formatMessage(pageMessages.CertificatePreviewModal.demoName),
    number: memberCertificate.number,
    title: memberCertificate.certificate.title || '',
    qualification: memberCertificate.certificate.qualification,
    backgroundImage: memberCertificate.certificate.templateImage,
  }

  const deliveredAt = memberCertificate.deliveredAt
    ? moment(memberCertificate.deliveredAt).format('YYYY/MM/DD')
    : undefined

  const templateVars = {
    ...defaultTemplateVars,
    ...memberCertificate.values,
    deliveredAt,
  }

  const certificateRef = useRef<HTMLDivElement | null>(null)

  return (
    <StyledModal title={null} footer={null} {...modalProps} width={1000}>
      <div>
        <CertificateContentCard memberCertificate={memberCertificate} />
        <CertificateImageCard
          template={memberCertificate.certificate.template || ''}
          templateVars={templateVars}
          ref={certificateRef}
        />
      </div>
    </StyledModal>
  )
}

export default CertificatePreviewModal
