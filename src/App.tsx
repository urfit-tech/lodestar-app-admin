import Application from 'lodestar-app-admin/src/Application'
import React from 'react'
import './App.scss'
import MemberCollectionAdminPage from './pages/MemberCollectionAdminPage'
import MemberNoteAdminPage from './pages/MemberNoteAdminPage'
import MemberContractPage from './pages/MemberContractPage'
import TermsPtPage from './pages/TermsPtPage'

const App = () => {
  return (
    <Application
      appId="xuemi"
      extraRouteProps={{
        owner_members: {
          path: '/admin/members',
          pageName: <MemberCollectionAdminPage />,
          authenticated: true,
        },
        owner_member_note: {
          path: '/admin/members/:memberId/note',
          pageName: <MemberNoteAdminPage />,
          authenticated: true,
        },
        member_contract_creation: {
          path: '/member-contract',
          pageName: <MemberContractPage />,
          authenticated: true,
        },
        terms: {
          path: '/terms',
          pageName: <TermsPtPage />,
          authenticated: false,
        },
      }}
    />
  )
}

export default App
