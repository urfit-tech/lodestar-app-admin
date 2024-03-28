import { Box, Text } from '@chakra-ui/react'
import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Select, Slider, Spin } from 'antd'
import { DESKTOP_BREAK_POINT } from 'lodestar-app-element/src/components/common/Responsive'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { Moment } from 'moment'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { useProperty } from '../../hooks/member'
import { salesLeadDeliveryPageMessages } from '../../pages/SalesLeadDeliveryPage/translation'
import { Filter } from '../../types/sales'
import CategoryInput from '../common/CategoryInput'
import ManagerInput from '../common/ManagerInput'
import { ExcludeCheckBox, SalesLeadTypeFilter } from './SalesLeadFilter'

const StyledExactMatchCheckBoxFormItem = styled(Form.Item)`
  left: 0%;
  bottom: -150%;
  display: flex;
  position: absolute;
  @media (min-width: ${DESKTOP_BREAK_POINT}px) {
    left: auto;
    bottom: auto;
    right: -120px;
  }
`

const StyledPropertiesFormItem = styled(Form.Item)`
  margin-bottom: 40px;
  @media (min-width: ${DESKTOP_BREAK_POINT}px) {
    margin-bottom: 24px;
  }
`

const SalesLeadFilterSection: React.FC<{
  filter: Filter
  onNext?: (filter: Filter) => void
}> = ({ filter, onNext }) => {
  const { formatMessage } = useIntl()
  const [starRangeIsNull, setStarRangeIsNull] = useState(filter.starRangeIsNull)
  const [notCalled, setNotCalled] = useState(filter.notCalled)
  const [notAnswered, setNotAnswered] = useState(filter.notAnswered)
  const [lastCalledRange, setLastCalledRange] = useState<[Moment | null, Moment | null] | null>(filter.lastCalledRange)
  const [lastAnsweredRange, setLastAnsweredRange] = useState<[Moment | null, Moment | null] | null>(
    filter.lastAnsweredRange,
  )
  const [excludeLastCalled, setExcludeLastCalled] = useState(filter.excludeLastCalled)
  const [excludeLastAnswered, setExcludeLastAnswered] = useState(filter.excludeLastAnswered)
  const [starRange, setStarRange] = useState<[number, number]>([-999, 999])
  const { loadingProperties, properties } = useProperty()
  const { currentMemberId } = useAuth()

  return (
    <Form<Filter>
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 12 }}
      initialValues={filter}
      onFinish={values => onNext?.({ ...values, starRange, excludeLastCalled, excludeLastAnswered })}
    >
      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.originalManager)}
        name="managerId"
      >
        <ManagerInput />
      </Form.Item>

      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.field)} name="categoryIds">
        <CategoryInput categoryClass="member" />
      </Form.Item>

      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.starRangeIsNull)}
        name="starRangeIsNull"
        valuePropName="checked"
      >
        <Checkbox onChange={e => setStarRangeIsNull(e.target.checked)} />
      </Form.Item>

      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.starRange)}>
        <Slider
          range
          min={-999}
          max={999}
          disabled={starRangeIsNull}
          value={[starRange[0], starRange[1]]}
          onChange={v => setStarRange(v)}
        />
      </Form.Item>

      <Form.Item label=" " colon={false}>
        <Input.Group compact>
          <Form.Item noStyle>
            <InputNumber
              min={-999}
              max={999}
              disabled={starRangeIsNull}
              value={starRange[0]}
              onChange={v => v && (+v > starRange[1] ? setStarRange([+v, +v]) : setStarRange([+v, starRange[1]]))}
            />
          </Form.Item>
          <div style={{ height: '43px', marginLeft: '0.25rem', marginRight: '0.25rem' }}>
            <div className="d-flex align-items-center" style={{ height: '100%' }}>
              ~
            </div>
          </div>
          <Form.Item noStyle>
            <InputNumber
              min={-999}
              max={999}
              disabled={starRangeIsNull}
              value={starRange[1]}
              onChange={v => v && (+v < starRange[0] ? setStarRange([+v, +v]) : setStarRange([starRange[0], +v]))}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.createdAtRange)}
        name="createdAtRange"
      >
        <DatePicker.RangePicker allowClear />
      </Form.Item>

      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.notCalled)}
        name="notCalled"
        valuePropName="checked"
      >
        <Checkbox onChange={e => setNotCalled(e.target.checked)} />
      </Form.Item>

      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastCalledRange)}>
        <Box>
          <Form.Item name="lastCalledRange" noStyle getValueProps={v => ({ value: notCalled ? [null, null] : v })}>
            <DatePicker.RangePicker
              allowClear
              disabled={notCalled}
              onChange={data => {
                if (!data) {
                  setExcludeLastCalled(false)
                }
                setLastCalledRange(data)
              }}
            />
          </Form.Item>
          <ExcludeCheckBox
            formName="excludeLastCalled"
            getValueProps={() => ({ checked: notCalled ? false : excludeLastCalled })}
            onChange={e => setExcludeLastCalled(e.target.checked)}
            disabled={notCalled ? true : !lastCalledRange}
            text={`${formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.excluded)}${formatMessage(
              salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastCalledRange,
            )}`}
          />
        </Box>
      </Form.Item>

      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.notAnswered)}
        name="notAnswered"
        valuePropName="checked"
      >
        <Checkbox onChange={e => setNotAnswered(e.target.checked)} />
      </Form.Item>

      <Form.Item label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastAnsweredRange)}>
        <Box>
          <Form.Item name="lastAnsweredRange" noStyle getValueProps={v => ({ value: notAnswered ? [null, null] : v })}>
            <DatePicker.RangePicker
              allowClear
              disabled={notAnswered}
              onChange={data => {
                if (!data) {
                  setExcludeLastAnswered(false)
                }
                setLastAnsweredRange(data)
              }}
            />
          </Form.Item>
          <ExcludeCheckBox
            formName="excludeLastAnswered"
            getValueProps={() => ({ checked: notAnswered ? false : excludeLastAnswered })}
            onChange={e => setExcludeLastAnswered(e.target.checked)}
            disabled={notAnswered ? true : !lastAnsweredRange}
            text={`${formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.excluded)}${formatMessage(
              salesLeadDeliveryPageMessages.salesLeadDeliveryPage.lastAnsweredRange,
            )}`}
          />
        </Box>
      </Form.Item>

      <SalesLeadTypeFilter
        formName="completedLead"
        formLabel={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead)}
      />

      <SalesLeadTypeFilter
        formName="closedLead"
        formLabel={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.closedLead)}
      />

      <Form.Item
        label={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.closedRange)}
        name="closedAtRange"
        getValueProps={v => ({ value: notCalled ? [null, null] : v })}
      >
        <DatePicker.RangePicker allowClear disabled={notCalled} />
      </Form.Item>

      <SalesLeadTypeFilter
        formName="recycledLead"
        formLabel={formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.recycledLead)}
      />

      {!currentMemberId || loadingProperties ? (
        <Spin />
      ) : (
        properties.map(property => (
          <StyledPropertiesFormItem label={property.name} key={property.id}>
            {property?.placeholder?.includes('/') ? (
              <Form.Item name={property.name} style={{ width: '100%', margin: '0px' }}>
                <Select>
                  {property?.placeholder?.split('/').map((value: string) => (
                    <Select.Option key={v4()} value={value}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Box position="relative" w="100%" display="flex">
                <Form.Item name={property.name} style={{ width: '100%', margin: '0px' }}>
                  <Input style={{ width: '100%' }} />
                </Form.Item>
                <StyledExactMatchCheckBoxFormItem name={`is${property.name}ExactMatch`} valuePropName="checked">
                  <Checkbox style={{ display: 'flex', alignItems: 'center' }}>
                    <Text color="var(--gary-dark)" size="sm">
                      {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.exactMatch)}
                    </Text>
                  </Checkbox>
                </StyledExactMatchCheckBoxFormItem>
              </Box>
            )}
          </StyledPropertiesFormItem>
        ))
      )}

      <Form.Item wrapperCol={{ offset: 6 }}>
        <Button type="primary" htmlType="submit">
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.nextStep)}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default SalesLeadFilterSection
