import { Divider, Dropdown, Icon, Menu, Spin } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import { commonMessages, programMessages } from '../../helpers/translation'
import { useProgramPackageCollection, useProgramPackagePlanCollection } from '../../hooks/programPackage'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

const StyledProgramPackageTitle = styled.div`
  margin: 0 auto;
  width: 25rem;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledProgramPackagePlanTitle = styled.div`
  color: var(--gray-darker);
  letter-spacing: 0.2px;
`
const StyledItem = styled(Menu.Item)`
  width: 25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ProgramTempoDeliveryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  const { loadingProgramPackage, programPackages } = useProgramPackageCollection()
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const packageId = selectedPackageId || programPackages[0]?.id || null

  const { loadingProgramPackagePlans, programPackagePlans } = useProgramPackagePlanCollection(packageId)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const planId = selectedPlanId || programPackagePlans[0]?.id || null

  return (
    <OwnerAdminLayout>
      <AdminPageTitle className="mb-5">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.tempoDelivery)}</span>
      </AdminPageTitle>

      <AdminBlock>
        <div className="text-center">
          {loadingProgramPackage ? (
            <Spin />
          ) : programPackages.length > 0 ? (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu
                  onClick={({ key }) => {
                    setSelectedPackageId(key)
                    setSelectedPlanId(null)
                  }}
                >
                  {programPackages.map(programPackage => (
                    <StyledItem key={programPackage.id}>{programPackage.title}</StyledItem>
                  ))}
                </Menu>
              }
            >
              <StyledProgramPackageTitle className="d-flex align-items-center justify-content-center cursor-pointer">
                <div className="mx-2">
                  {programPackages.find(programPackage => programPackage.id === packageId)?.title}
                </div>
                <Icon type="caret-down" className="ml-1" />
              </StyledProgramPackageTitle>
            </Dropdown>
          ) : null}
        </div>
        <Divider />
        <div className="text-center">
          {loadingProgramPackagePlans ? (
            <Spin />
          ) : programPackagePlans.length > 0 ? (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu onClick={({ key }) => setSelectedPlanId(key)}>
                  {programPackagePlans.map(programPackagePlan => (
                    <StyledItem key={programPackagePlan.id}>{programPackagePlan.title}</StyledItem>
                  ))}
                </Menu>
              }
            >
              <StyledProgramPackagePlanTitle className="d-flex align-items-center justify-content-center cursor-pointer">
                <div className="mr-1">{formatMessage(programMessages.label.planField)}</div>
                <div className="mx-2">
                  {programPackagePlans.find(programPackagePlan => programPackagePlan.id === planId)?.title}
                </div>
                <Icon type="caret-down" className="ml-1" />
              </StyledProgramPackagePlanTitle>
            </Dropdown>
          ) : null}
        </div>
      </AdminBlock>
    </OwnerAdminLayout>
  )
}

export default ProgramTempoDeliveryAdminPage
