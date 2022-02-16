import { Checkbox, Form, Select, TreeSelect } from 'antd'
import { ButtonProps } from 'lodestar-app-element/src/components/buttons/Button'
import ProductTypeLabel from 'lodestar-app-element/src/components/labels/ProductTypeLabel'
import { ProductPurchaseProductSource } from 'lodestar-app-element/src/types/options'
import { keys, pick } from 'ramda'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { useAllBriefProductCollection } from '../../hooks/data'
import { CraftSettingLabel, StyledUnderLineInput } from '../../pages/CraftPageAdminPage/CraftSettingsPanel'

type ButtonActionOptions = ButtonProps['source']

const StyledProductParent = styled.div`
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
`
const StyledProductTitle = styled.div`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  ${StyledProductParent} + & {
    max-width: 14rem;
    :before {
      content: ' - ';
    }
  }
`

const ButtonActionSelector: React.FC<{ value?: ButtonActionOptions; onChange?: (value: ButtonActionOptions) => void }> =
  ({ value = { from: 'openLink' }, onChange }) => {
    const { formatMessage } = useIntl()

    return (
      <>
        <Form.Item
          label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.actionSetting)}</CraftSettingLabel>}
        >
          <Select<typeof value.from>
            placeholder={formatMessage(craftPageMessages.label.choiceProduct)}
            value={value.from}
            onChange={from => {
              switch (from) {
                case 'openLink':
                  onChange?.({ from, openNewTab: false })
                  break
                case 'purchaseProduct':
                  onChange?.({ from })
                  break
              }
            }}
            filterOption={(input, option) =>
              option?.props?.children
                ? (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                : true
            }
          >
            <Select.Option key="openLink" value="openLink">
              {formatMessage(craftPageMessages.label.openLink)}
            </Select.Option>
            <Select.Option key="purchaseProduct" value="purchaseProduct">
              {formatMessage(craftPageMessages.label.purchaseProduct)}
            </Select.Option>
          </Select>
        </Form.Item>

        {value.from === 'openLink' && (
          <>
            <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.openLink)}</CraftSettingLabel>}>
              <StyledUnderLineInput
                className="mb-2"
                placeholder="https://"
                value={value.link}
                onChange={e => onChange?.({ ...value, link: e.target.value })}
              />
            </Form.Item>
            <Form.Item valuePropName="checked">
              <Checkbox
                checked={value.openNewTab}
                onChange={e => onChange?.({ ...value, openNewTab: e.target.checked })}
              >
                {formatMessage(craftPageMessages.label.openNewTab)}
              </Checkbox>
            </Form.Item>
          </>
        )}
        {value.from === 'purchaseProduct' && <PurchaseProductSelector value={value} onChange={onChange} />}
      </>
    )
  }

const PurchaseProductSelector: React.FC<{
  value?: ProductPurchaseProductSource
  onChange?: (value: ButtonActionOptions) => void
}> = ({ value = { from: 'purchaseProduct' }, onChange }) => {
  const { formatMessage } = useIntl()
  const { briefProducts } = useAllBriefProductCollection()
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(value?.productId)

  const partBriefProducts = pick(
    ['ActivityTicket', 'PodcastPlan', 'PodcastProgram', 'ProgramPackagePlan', 'ProgramPlan', 'ProjectPlan'],
    briefProducts,
  )

  return (
    <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.purchaseProduct)}</CraftSettingLabel>}>
      <TreeSelect
        showSearch
        allowClear
        placeholder={formatMessage(commonMessages.product.selectProducts)}
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        value={selectedProductId}
        onChange={selectedValue => {
          setSelectedProductId(selectedValue)
          onChange &&
            onChange({
              from: 'purchaseProduct',
              productId: selectedValue,
            })
        }}
        treeNodeFilterProp="name"
      >
        {keys(partBriefProducts).map(
          productType =>
            partBriefProducts[productType]?.length && (
              <TreeSelect.TreeNode
                disable
                key={productType}
                value={productType}
                title={<ProductTypeLabel productType={productType} />}
                checkable={false}
              >
                {briefProducts[productType]?.map(product => (
                  <TreeSelect.TreeNode
                    key={product.productId}
                    value={product.productId}
                    name={product.title}
                    title={
                      <div className="d-flex">
                        {product.parent && <StyledProductParent>{product.parent}</StyledProductParent>}
                        <StyledProductTitle>{product.title}</StyledProductTitle>
                      </div>
                    }
                  />
                ))}
              </TreeSelect.TreeNode>
            ),
        )}
      </TreeSelect>
    </Form.Item>
  )
}

export default ButtonActionSelector
