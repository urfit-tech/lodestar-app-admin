import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura from '../../hasura'
import { commonMessages, questionLibraryMessage } from '../../helpers/translation'
import { QuestionLibraryIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import QuestionLibraryCollectionTable from './QuestionLibraryCollectionTable'

type FieldProps = {
  title: string
  memberId: string
}

const QuestionLibraryCollectionPage: React.VFC = () => {
  const history = useHistory()
  const { enabledModules, id: appId } = useApp()
  const { isAuthenticating, currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [createQuestionLibrary] = useMutation<hasura.INSERT_QUESTION_LIBRARY, hasura.INSERT_QUESTION_LIBRARYVariables>(
    INSERT_QUESTION_LIBRARY,
  )

  const handleSubmit = (modifierId: string) => {
    setLoading(true)
    form.validateFields().then(() => {
      const values = form.getFieldsValue()
      createQuestionLibrary({ variables: { title: values.title || '', modifierId: modifierId, appId: appId } })
        .then(({ data }) => {
          const questionLibraryId = data?.insert_question_library?.returning[0]?.id
          setLoading(false)
          questionLibraryId && history.push(`/question-libraries/${questionLibraryId}`)
        })
        .catch(handleError)
    })
  }

  if (isAuthenticating || Object.keys(enabledModules).length === 0) {
    return <LoadingPage />
  }

  if (!enabledModules.question_library) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <QuestionLibraryIcon className="mr-3" />
          <span>{formatMessage(pageMessages['QuestionLibraryCollectionPage'].questionLibraryCollection)}</span>
        </AdminPageTitle>
      </div>
      {currentMemberId && appId && (
        <>
          <div className="mb-4">
            <AdminModal
              renderTrigger={({ setVisible }) => (
                <Button className="mb-4" type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                  {formatMessage(questionLibraryMessage.input.addQuestionLibrary)}
                </Button>
              )}
              title={formatMessage(questionLibraryMessage.input.addQuestionLibrary)}
              okText={formatMessage(commonMessages.ui.save)}
              onOk={e => {
                handleSubmit(currentMemberId)
              }}
              okButtonProps={{ loading }}
            >
              <Form
                form={form}
                layout="vertical"
                colon={false}
                hideRequiredMark
                initialValues={{
                  title: formatMessage(questionLibraryMessage.input.untitledQuestionLibrary),
                }}
              >
                <Form.Item name="title" required={true}>
                  <Input />
                </Form.Item>
              </Form>
            </AdminModal>
          </div>
          <QuestionLibraryCollectionTable appId={appId} currentMemberId={currentMemberId} />
        </>
      )}
    </AdminLayout>
  )
}

export default QuestionLibraryCollectionPage

const INSERT_QUESTION_LIBRARY = gql`
  mutation INSERT_QUESTION_LIBRARY($title: String!, $modifierId: String!, $appId: String!) {
    insert_question_library(objects: { title: $title, modifier_id: $modifierId, app_id: $appId }) {
      affected_rows
      returning {
        id
      }
    }
  }
`
