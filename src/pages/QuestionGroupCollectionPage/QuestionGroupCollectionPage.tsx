import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { QuestionLibraryIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import QuestionGroupCollectionTable from './QuestionGroupCollectionTable'

const QuestionLibraryCollectionPage: React.VFC = () => {
  const { enabledModules, id: appId } = useApp()
  const { isAuthenticating, currentMemberId, authToken } = useAuth()
  const { formatMessage } = useIntl()

  if ((isAuthenticating && !authToken) || Object.keys(enabledModules).length === 0) {
    return <LoadingPage />
  }

  if (!enabledModules.question_library) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-5 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <QuestionLibraryIcon className="mr-3" />
          <span>{formatMessage(pageMessages['QuestionGroupCollectionPage'].questionGroupCollection)}</span>
        </AdminPageTitle>
      </div>
      {currentMemberId && appId && <QuestionGroupCollectionTable appId={appId} currentMemberId={currentMemberId} />}
    </AdminLayout>
  )
}

export default QuestionLibraryCollectionPage
