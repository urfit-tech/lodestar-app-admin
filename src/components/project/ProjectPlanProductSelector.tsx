import { Button, Divider, Form, Input, InputNumber } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useCurrency } from '../../hooks/currency'
import { useProductSku } from '../../hooks/data'
import { TrashOIcon } from '../../images/icon'
import { ProjectPlanProduct } from '../../types/project'
import ProductSelector from '../form/ProductSelector'
import projectMessages from './translation'

const StyledDeleteButton = styled(Button)`
  padding-top: 0.7rem;
  padding-left: 1rem;
`
type ProjectPlanProductSelectorProps = {
  value?: ProjectPlanProduct[]
  onChange?: (value: ProjectPlanProduct[]) => void
}

const SkuReadOnlyInput: React.VFC<{ productId: string }> = ({ productId }) => {
  const { product } = useProductSku(productId)
  return <Input disabled value={product?.sku || ''} />
}

const ProjectPlanProductSelector: React.FC<ProjectPlanProductSelectorProps> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const { formatCurrency } = useCurrency()
  const { enabledModules } = useApp()
  const projectPlanProducts = value || []

  return (
    <div>
      {projectPlanProducts.map((projectPlanProduct, idx) => {
        return (
          <div className="mb-1" key={projectPlanProduct.id + idx}>
            {idx > 0 && <Divider />}
            <div className="d-flex mb-2">
              <ProductSelector
                value={projectPlanProduct.id ? [projectPlanProduct.id] : []}
                onlyValid={true}
                onChange={products =>
                  onChange?.([
                    ...projectPlanProducts.slice(0, idx),
                    { id: products[0] || '', options: projectPlanProduct.options },
                    ...projectPlanProducts.slice(idx + 1),
                  ])
                }
                allowTypes={[
                  'ProgramPlan',
                  'ProgramPackagePlan',
                  'ActivityTicket',
                  'PodcastProgram',
                  'Card',
                  'VoucherPlan',
                ]}
              />
              <InputNumber
                className="ml-3"
                value={projectPlanProduct.options.quantity || 1}
                onChange={v =>
                  onChange?.([
                    ...projectPlanProducts.slice(0, idx),
                    { id: projectPlanProduct.id, options: { quantity: Number(v) } },
                    ...projectPlanProducts.slice(idx + 1),
                  ])
                }
              />
              <StyledDeleteButton
                type="link"
                icon={<TrashOIcon />}
                onClick={() => {
                  onChange?.(
                    projectPlanProducts.filter(element => {
                      return element.id !== projectPlanProduct.id
                    }),
                  )
                }}
              />
            </div>
            <div className="d-flex">
              {enabledModules.sku && (
                <Form.Item label={formatMessage(projectMessages.ProjectPlanProductSelector.sku)} className="mr-3">
                  <SkuReadOnlyInput productId={projectPlanProduct.id} />
                </Form.Item>
              )}
              <Form.Item label={formatMessage(projectMessages.ProjectPlanProductSelector.recognizePrice)}>
                <InputNumber
                  value={projectPlanProduct.options.recognizePrice || 0}
                  min={0}
                  formatter={value => formatCurrency(value ? +value : 0)}
                  parser={value => (value ? value.replace(/[^\d.]/g, '') : '')}
                  onChange={v =>
                    onChange?.([
                      ...projectPlanProducts.slice(0, idx),
                      {
                        id: projectPlanProduct.id,
                        options: { ...projectPlanProduct.options, recognizePrice: Number(v) },
                      },
                      ...projectPlanProducts.slice(idx + 1),
                    ])
                  }
                />
              </Form.Item>
            </div>
          </div>
        )
      })}
      <Button type="link" onClick={() => onChange?.([...(value || []), { id: '', options: {} }])}>
        {formatMessage(projectMessages.ProjectPlanProductSelector.addDeliverables)}
      </Button>
    </div>
  )
}

export default ProjectPlanProductSelector
