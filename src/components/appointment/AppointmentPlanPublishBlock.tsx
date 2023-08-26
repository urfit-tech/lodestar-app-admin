import { DownOutlined, RightOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button, Dropdown, Menu, Modal, Skeleton, Typography } from 'antd'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { ReactComponent as StatusAlertIcon } from '../../images/default/status-alert.svg'
import { ReactComponent as StatusOrdinaryIcon } from '../../images/default/status-ordinary.svg'
import { ReactComponent as StatusSuccessIcon } from '../../images/default/status-success.svg'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import { AppointmentPlanAdmin } from '../../types/appointment'
import { AdminBlock } from '../admin'

const AppointmentPlanPublishBlock: React.FC<{
  appointmentPlanAdmin: AppointmentPlanAdmin | null
  onRefetch?: () => void
}> = ({ appointmentPlanAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const [publishState, setPublishState] = useState<string>(formatMessage(commonMessages.ui.publiclyPublished))
  const [publishAppointmentPlan] = useMutation<
    hasura.PUBLISH_APPOINTMENT_PLAN,
    hasura.PUBLISH_APPOINTMENT_PLANVariables
  >(PUBLISH_APPOINTMENT_PLAN)

  if (!appointmentPlanAdmin) {
    return <Skeleton active />
  }

  const errors: { message: string; to: string }[] = []

  !appointmentPlanAdmin.title &&
    errors.push({
      message: formatMessage(appointmentMessages.text.noTitle),
      to: `/appointment-plans/${appointmentPlanAdmin.id}?tab=settings`,
    })
  !appointmentPlanAdmin.duration &&
    errors.push({
      message: formatMessage(appointmentMessages.text.noDuration),
      to: `/appointment-plans/${appointmentPlanAdmin.id}?tab=sale`,
    })
  !appointmentPlanAdmin.periods.length &&
    errors.push({
      message: formatMessage(appointmentMessages.text.noPeriod),
      to: `/appointment-plans/${appointmentPlanAdmin.id}?tab=schedule`,
    })

  const appointmentPlanStatus =
    errors.length > 0
      ? 'notValidated'
      : appointmentPlanAdmin.publishedAt
      ? 'unpublished'
      : appointmentPlanAdmin.isPrivate
      ? 'publishedInPrivate'
      : 'published'

  const appointmentPlanStatusMessage: {
    [status in typeof appointmentPlanStatus]: {
      title: string
      description: string
    }
  } = {
    notValidated: {
      title: formatMessage(commonMessages.status.notComplete),
      description: formatMessage(appointmentMessages.text.notCompleteNotation),
    },
    unpublished: {
      title: formatMessage(commonMessages.status.unpublished),
      description: formatMessage(appointmentMessages.text.isUnpublishedNotation),
    },
    published: {
      title: formatMessage(commonMessages.status.publiclyPublished),
      description: formatMessage(appointmentMessages.text.isPublishedNotation),
    },
    publishedInPrivate: {
      title: formatMessage(commonMessages.status.privatelyPublished),
      description: formatMessage(appointmentMessages.text.isPrivatePublishedNotation),
    },
  }

  const handlePublish = (isPrivate?: boolean) => {
    publishAppointmentPlan({
      variables: {
        appointmentPlanId: appointmentPlanAdmin.id,
        publishedAt: new Date(),
        isPrivate: isPrivate,
      },
    })
      .then(() => onRefetch?.())
      .catch(handleError)
  }

  const handleUnPublish = () => {
    Modal.confirm({
      title: formatMessage(commonMessages.text.unpublishingTitle),
      onOk: () => {
        publishAppointmentPlan({
          variables: {
            appointmentPlanId: appointmentPlanAdmin.id,
            publishedAt: null,
            isPrivate: false,
          },
        })
          .then(() => onRefetch?.())
          .catch(handleError)
      },
      onCancel: () => {},
    })
  }
  const overlay = (
    <Menu>
      {[formatMessage(commonMessages.ui.publiclyPublished), formatMessage(commonMessages.ui.privatelyPublished)]
        .filter(publishType => publishType !== appointmentPlanStatus)
        .map(publishType => (
          <Menu.Item key={publishType}>
            <Button
              type="link"
              onClick={() => {
                setPublishState(publishType)
                handlePublish(publishType !== formatMessage(commonMessages.ui.publiclyPublished))
              }}
            >
              {publishType}
            </Button>
          </Menu.Item>
        ))}
    </Menu>
  )

  return (
    <AdminBlock>
      <div className="d-flex flex-column align-items-center py-3">
        <div className="mb-3">
          {appointmentPlanStatus === 'notValidated' ? (
            <StatusAlertIcon />
          ) : appointmentPlanStatus === 'unpublished' ? (
            <StatusOrdinaryIcon />
          ) : appointmentPlanStatus === 'published' || appointmentPlanStatus === 'publishedInPrivate' ? (
            <StatusSuccessIcon />
          ) : null}
        </div>

        <Typography.Title level={4} className="mb-2">
          {appointmentPlanStatusMessage[appointmentPlanStatus].title}
        </Typography.Title>

        <Typography.Paragraph type="secondary" className="mb-3">
          {appointmentPlanStatusMessage[appointmentPlanStatus].description}
        </Typography.Paragraph>

        {appointmentPlanStatus === 'notValidated' && (
          <div className="px-5 py-4 mb-3" style={{ backgroundColor: '#f7f8f8', width: '100%' }}>
            {errors.map((error, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <ExclamationCircleIcon className="mr-1" />
                <span className="mr-1">{error.message}</span>
                <span>
                  <Link to={error.to}>
                    {formatMessage(commonMessages.ui.jumpTo)} <RightOutlined />
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}

        {appointmentPlanStatus === 'notValidated' ? (
          <Dropdown.Button disabled icon={<DownOutlined />} overlay={overlay}>
            <div>{publishState}</div>
          </Dropdown.Button>
        ) : appointmentPlanStatus === 'published' || appointmentPlanStatus === 'publishedInPrivate' ? (
          <Button onClick={handleUnPublish}>{formatMessage(commonMessages.ui.cancelPublishing)}</Button>
        ) : enabledModules.private_appointment_plan && appointmentPlanStatus === 'unpublished' ? (
          <Dropdown.Button
            type="primary"
            icon={<DownOutlined />}
            overlay={overlay}
            onClick={() => handlePublish(publishState === formatMessage(commonMessages.ui.privatelyPublished))}
          >
            <div>{publishState}</div>
          </Dropdown.Button>
        ) : appointmentPlanStatus === 'unpublished' ? (
          <Button
            type="primary"
            onClick={() => {
              setPublishState(formatMessage(commonMessages.ui.publiclyPublished))
              handlePublish(false)
            }}
          >
            {formatMessage(commonMessages.ui.publiclyPublished)}
          </Button>
        ) : null}
      </div>
    </AdminBlock>
  )
}

const PUBLISH_APPOINTMENT_PLAN = gql`
  mutation PUBLISH_APPOINTMENT_PLAN($appointmentPlanId: uuid!, $publishedAt: timestamptz, $isPrivate: Boolean) {
    update_appointment_plan(
      where: { id: { _eq: $appointmentPlanId } }
      _set: { published_at: $publishedAt, is_private: $isPrivate }
    ) {
      affected_rows
    }
  }
`

export default AppointmentPlanPublishBlock
