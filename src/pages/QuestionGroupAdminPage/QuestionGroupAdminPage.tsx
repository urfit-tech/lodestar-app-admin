import { CloseOutlined } from '@ant-design/icons'
import { Grid, GridItem } from '@chakra-ui/react'
import { Button, Checkbox, Collapse, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import { BarsIcon, GridIcon, PlusIcon, TrashOIcon } from '../../images/icon'

const StyledAdminHeader = styled(AdminHeader)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ececec;
  .header-left {
    display: flex;
    align-items: center;
  }
  .header-right {
    button {
      border-radius: 4px;
    }
  }
`

const StyledContent = styled.div`
  display: flex;
  height: 100vh;
  padding: 16px;
`

const QuestionGroupBlock = styled.div`
  width: 50%;
  padding: 0 24px 0 40px;
  overflow-y: scroll;
  .ant-collapse-header {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
    color: var(--gray-darker);
  }
  .ant-collapse > .ant-collapse-item > .ant-collapse-header {
    padding: 16px 24px;
  }
  .ant-collapse > .ant-collapse-item.ant-collapse-item-active .ant-collapse-header {
    padding-bottom: 0;
  }
`

const StyledCollapse = styled(Collapse)`
  background-color: #fff;
  margin-bottom: 20px;
  .ant-collapse-content {
    background-color: #fff;
    border: none;
  }
  .ant-collapse-content-active {
    height: auto;
  }
`

const Question = styled(Collapse.Panel)`
  .ant-collapse-content-box {
    padding: 16px 24px;
  }
`

const QuestionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledP = styled.p`
  font-size: 16px;
  color: var(--gray-darker);
  padding-bottom: 16px;
`

const LayoutOptionsBlock = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 32px;
`

const LayoutOptionsButtonGroup = styled(Radio.Group)`
  display: flex;
  flex-direction: row;
`

const LayoutOptionButton = styled(Radio.Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
`

const StyledCheckBox = styled(Checkbox)`
  margin-left: 16px;
`

const QuestionSubject = styled.div`
  padding-bottom: 20px;
  .bf-content {
    height: 200px;
    border: 1px solid var(--gray);
    border-top: none;
    border-radius: 4px;
  }
`

const QuestionOptionsBlock = styled.div`
  padding: 0 0 32px 24px;
  width: 100%;
`

const QuestionOption = styled.div`
  padding: 24px;
  margin-bottom: 20px;
  background-color: #f7f8f8;
  border-radius: 4px;
  .bf-content {
    background-color: #fff;
    height: 100px;
    border: 1px solid var(--gray);
    border-top: none;
    border-radius: 4px;
  }
`

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  span {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
    color: var(--gray-darker);
  }
  svg {
    cursor: pointer;
  }
`

const AddButton = styled(Button)`
  padding: 0;
  span {
    margin-left: 8px;
  }
`

const ExplanationBlock = styled.div`
  .bf-content {
    height: 120px;
    border: 1px solid var(--gray);
    border-top: none;
    border-radius: 4px;
  }
`

const AddQuestionBlock = styled.div`
  position: relative;
  text-align: center;
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 50%;
    width: 40%;
    height: 2px;
    background-color: #ececec;
  }
  &:after {
    content: '';
    display: block;
    position: absolute;
    right: 0;
    top: 50%;
    width: 40%;
    height: 2px;
    background-color: #ececec;
  }
`

const PreviewBlock = styled.div`
  width: 50%;
  background-color: #f7f8f8;
  overflow-y: scroll;
`

const PreviewQuestion = styled.div`
  margin: 24px;
  padding: 40px;
  background-color: #fff;
`

const CurrentQuestionIndex = styled.div`
  padding-bottom: 12px;
  p {
    margin: 0;
    color: var(--gray-dark);
  }
`

const PreviewSubject = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.69;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
  padding-bottom: 24px;
`

const PreviewOptions = styled.div<{ layoutOption: string }>``

const ColumnOption = styled.div`
  padding: 16px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: #585858;
  border: 1px solid var(--gray);
  border-radius: 4px;
`

const GridOption = styled.div<{ imgSrc: string }>`
  position: relative;
  border: 1px solid var(--gray);
  border-radius: 4px;
  .image-container {
    width: 100%;
  }
  .image-container:before {
    content: '';
    display: block;
    width: 100%;
    padding-top: 100%;
  }
  .image-container .option-image {
    background-image: url(${props => (props.imgSrc ? props.imgSrc : '')});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;

    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`

const StyledBarsIcon = styled(BarsIcon)<{ layoutOption: string }>`
  path {
    fill: ${props => (props.layoutOption === 'column' ? '#fff' : '#585858')};
  }
`

const StyledGridIcon = styled(GridIcon)<{ layoutOption: string }>`
  path {
    fill: ${props => (props.layoutOption === 'grid' ? '#fff' : '#585858')};
  }
`

const ExamName = styled.p`
  font-size: 18px;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.8px;
  padding-bottom: 24px;
`

const QuestionGroupAdminPage: React.VFC = () => {
  const history = useHistory()
  const { currentMemberId } = useAuth()
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const { questionLibraryId } = useParams<{ questionLibraryId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const [questionGroupType, setQuestionGroupType] = useState<string>('new')
  const [savingLoading, setSavingLoading] = useState<boolean>(false)
  const [layoutOption, setLayoutOption] = useState<string>('column')

  //   if (Object.keys(enabledModules).length === 0 || loading) {
  //     return <LoadingPage />
  //   }

  const onLayoutOptionChange = (e: RadioChangeEvent) => {
    setLayoutOption(e.target.value)
  }

  useEffect(() => {
    document.body.style.overflowY = 'hidden'
  }, [])

  return (
    <>
      <StyledAdminHeader>
        <div className="header-left">
          <Button type="link" className="mr-2" onClick={() => history.goBack()}>
            <CloseOutlined />
          </Button>

          {/* {loading ? (
          <>
            <Spinner />
            <span className="flex-grow-1" />
          </>
        ) : ( */}
          <AdminHeaderTitle>超強題庫123</AdminHeaderTitle>
          {/* )} */}
        </div>
        <div className="header-right">
          <Button className="ml-3">取消</Button>
          <Button className="ml-3" type="primary">
            儲存
          </Button>
        </div>
      </StyledAdminHeader>
      <StyledContent>
        <QuestionGroupBlock>
          <StyledCollapse accordion>
            <Question
              header={
                <QuestionTitle>
                  題目 1
                  <TrashOIcon
                    style={{ zIndex: '2' }}
                    onClick={() => {
                      alert(345)
                    }}
                  />
                </QuestionTitle>
              }
              key="1"
              showArrow={false}
            >
              <StyledP>版型選項</StyledP>
              <LayoutOptionsBlock>
                <LayoutOptionsButtonGroup defaultValue="column" buttonStyle="solid" onChange={onLayoutOptionChange}>
                  <LayoutOptionButton value="column">
                    <StyledBarsIcon layoutOption={layoutOption} />
                  </LayoutOptionButton>
                  <LayoutOptionButton value="grid">
                    <StyledGridIcon layoutOption={layoutOption} />
                  </LayoutOptionButton>
                </LayoutOptionsButtonGroup>
                <StyledCheckBox>使用注音字型</StyledCheckBox>
              </LayoutOptionsBlock>
              <StyledP>題目</StyledP>
              <QuestionSubject>
                <AdminBraftEditor />
              </QuestionSubject>
              <QuestionOptionsBlock>
                <QuestionOption>
                  <OptionHeader>
                    <span>選項 1</span>
                    <TrashOIcon
                      onClick={() => {
                        alert(123)
                      }}
                    />
                  </OptionHeader>
                  <AdminBraftEditor />
                </QuestionOption>
                <QuestionOption>
                  <OptionHeader>
                    <span>選項 2</span>
                    <TrashOIcon
                      onClick={() => {
                        alert(345)
                      }}
                    />
                  </OptionHeader>
                  <AdminBraftEditor />
                </QuestionOption>
                <AddButton
                  type="link"
                  icon={<PlusIcon />}
                  className="align-items-center"
                  onClick={() => alert('新增選項')}
                >
                  <span>新增選項</span>
                </AddButton>
              </QuestionOptionsBlock>
              <ExplanationBlock>
                <StyledP>解答說明</StyledP>
                <AdminBraftEditor />
              </ExplanationBlock>
            </Question>
            <Question
              header={
                <QuestionTitle>
                  題目 2
                  <TrashOIcon
                    style={{ zIndex: '2' }}
                    onClick={() => {
                      alert(345)
                    }}
                  />
                </QuestionTitle>
              }
              key="2"
              showArrow={false}
            >
              <StyledP>版型選項</StyledP>
              <LayoutOptionsBlock>
                <LayoutOptionsButtonGroup defaultValue="column" buttonStyle="solid" onChange={onLayoutOptionChange}>
                  <LayoutOptionButton value="column">
                    <StyledBarsIcon layoutOption={layoutOption} />
                  </LayoutOptionButton>
                  <LayoutOptionButton value="grid">
                    <StyledGridIcon layoutOption={layoutOption} />
                  </LayoutOptionButton>
                </LayoutOptionsButtonGroup>
                <StyledCheckBox>使用注音字型</StyledCheckBox>
              </LayoutOptionsBlock>
              <StyledP>題目</StyledP>
              <QuestionSubject>
                <AdminBraftEditor />
              </QuestionSubject>
              <QuestionOptionsBlock>
                <QuestionOption>
                  <OptionHeader>
                    <span>選項 1</span>
                    <TrashOIcon
                      onClick={() => {
                        alert(123)
                      }}
                    />
                  </OptionHeader>
                  <AdminBraftEditor />
                </QuestionOption>
                <QuestionOption>
                  <OptionHeader>
                    <span>選項 2</span>
                    <TrashOIcon
                      onClick={() => {
                        alert(345)
                      }}
                    />
                  </OptionHeader>
                  <AdminBraftEditor />
                </QuestionOption>
                <AddButton
                  type="link"
                  icon={<PlusIcon />}
                  className="align-items-center"
                  onClick={() => alert('新增選項')}
                >
                  <span>新增選項</span>
                </AddButton>
              </QuestionOptionsBlock>
              <ExplanationBlock>
                <StyledP>解答說明</StyledP>
                <AdminBraftEditor />
              </ExplanationBlock>
            </Question>
          </StyledCollapse>
          <AddQuestionBlock>
            <AddButton type="link" icon={<PlusIcon />} className="align-items-center" onClick={() => alert('新增題目')}>
              <span>新增題目</span>
            </AddButton>
          </AddQuestionBlock>
        </QuestionGroupBlock>
        <PreviewBlock>
          <PreviewQuestion>
            <ExamName>課後測驗</ExamName>
            <CurrentQuestionIndex>
              <p>1 / 2</p>
            </CurrentQuestionIndex>
            <PreviewSubject>
              小陳正在考慮使用付費搜尋廣告為自己的商家放送廣告。
              <br />
              你認為付費搜尋廣告這種行銷方式如此有效的原因何在？
            </PreviewSubject>
            <PreviewOptions layoutOption={layoutOption}>
              {layoutOption === 'column' ? (
                <>
                  <ColumnOption>選項一</ColumnOption>
                  <ColumnOption>選項二</ColumnOption>
                  <ColumnOption>選項三</ColumnOption>
                  <ColumnOption>選項四</ColumnOption>
                </>
              ) : (
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem colSpan={1} w="100%">
                    <GridOption imgSrc="https://i.ytimg.com/vi/_ranO9lNH7A/maxresdefault.jpg">
                      <div className="image-container">
                        <div className="option-image"></div>
                      </div>
                    </GridOption>
                  </GridItem>
                  <GridItem colSpan={1} w="100%">
                    <GridOption imgSrc="https://i.ytimg.com/vi/_ranO9lNH7A/maxresdefault.jpg">
                      <div className="image-container">
                        <div className="option-image"></div>
                      </div>
                    </GridOption>
                  </GridItem>
                  <GridItem colSpan={1} w="100%">
                    <GridOption imgSrc="https://i.ytimg.com/vi/_ranO9lNH7A/maxresdefault.jpg">
                      <div className="image-container">
                        <div className="option-image"></div>
                      </div>
                    </GridOption>
                  </GridItem>
                  <GridItem colSpan={1} w="100%">
                    <GridOption imgSrc="https://i.ytimg.com/vi/_ranO9lNH7A/maxresdefault.jpg">
                      <div className="image-container">
                        <div className="option-image"></div>
                      </div>
                    </GridOption>
                  </GridItem>
                </Grid>
              )}
            </PreviewOptions>
          </PreviewQuestion>
        </PreviewBlock>
      </StyledContent>
    </>
  )
}
export default QuestionGroupAdminPage
