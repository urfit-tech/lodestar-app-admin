import Icon from '@ant-design/icons'
import { CloseButton, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, HStack } from '@chakra-ui/react'
import { Button, Skeleton } from 'antd'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useDuplicatedPhoneList } from '../../hooks/member'
import { ReactComponent as AngleRightIcon } from '../../images/icon/angle-right.svg'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import pageMessages from '../../pages/translation'

const StyledAlertText = styled.div`
  height: 40px;
  margin-bottom: 20px;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: var(--error);
  background-color: #ffe9e5;
  curser: pointer;
`

const StyledDrawerTitle = styled.p`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`

const StyledDuplicatedNumberList = styled.ul`
  padding: 0 26px;
  margin: 0;
`

const StyledDuplicatedNumberListItem = styled.li`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
  margin-bottom: 20px;
`

const StyledDuplicatedNumberMemberList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
`

const StyledDuplicatedNumberMemberItemButton = styled(Button)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: auto;
  padding: 0;
  font-weight: 500;
  margin-top: 8px;

  span {
    margin: 0;
  }
`

const StyledDuplicatedNumberMemberName = styled.span`
  font-weight: bold;
`

const StyledDuplicatedNumberMemberEmail = styled.span`
  font-size: 14px;
`

const DuplicatePhoneBlock: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  const { loadingDuplicatedMemberPhone, loadingMembersInfo, duplicatedList } = useDuplicatedPhoneList()

  return !loadingDuplicatedMemberPhone && duplicatedList.length > 0 ? (
    <>
      <StyledAlertText
        className="d-flex align-items-center justify-content-between"
        onClick={() => {
          setOpen(true)
        }}
      >
        <span className="d-flex align-items-center">
          <Icon className="mr-2" component={() => <ExclamationCircleIcon />} />
          <span>{formatMessage(pageMessages.DuplicatePhoneBlock.duplicatedPhoneMemberExist)}</span>
        </span>
        <span className="d-flex align-items-center">
          {formatMessage(pageMessages['*'].view)}
          <Icon className="ml-2" component={() => <AngleRightIcon />} />
        </span>
      </StyledAlertText>
      <Drawer isOpen={open} placement="right" onClose={() => setOpen(false)} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack>
              <CloseButton onClick={() => setOpen(false)} />
              <StyledDrawerTitle>
                {formatMessage(pageMessages.DuplicatePhoneBlock.duplicatedPhoneMember)}
              </StyledDrawerTitle>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            {loadingMembersInfo ? (
              <Skeleton />
            ) : (
              duplicatedList.map(({ phone, members }) => (
                <StyledDuplicatedNumberList key={phone}>
                  <StyledDuplicatedNumberListItem>
                    {phone}
                    <StyledDuplicatedNumberMemberList>
                      {members.map(({ id, name, email }) => (
                        <StyledDuplicatedNumberMemberItemButton
                          type="link"
                          onClick={() => window.open(`${process.env.PUBLIC_URL}/members/${id}`, '_blank')}
                        >
                          <StyledDuplicatedNumberMemberName>{name}</StyledDuplicatedNumberMemberName>
                          <StyledDuplicatedNumberMemberEmail>{email}</StyledDuplicatedNumberMemberEmail>
                        </StyledDuplicatedNumberMemberItemButton>
                      ))}
                    </StyledDuplicatedNumberMemberList>
                  </StyledDuplicatedNumberListItem>
                </StyledDuplicatedNumberList>
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  ) : (
    <></>
  )
}

export default DuplicatePhoneBlock
