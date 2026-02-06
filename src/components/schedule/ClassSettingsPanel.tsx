import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Typography } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useCreateClassGroup, useOrdersByIds, usePermissionGroupsAsCampuses } from '../../hooks/scheduleManagement'
import { ClassGroup, Language } from '../../types/schedule'
import { ScheduleCard } from './styles'
import scheduleMessages from './translation'

interface ClassSettingsPanelProps {
  classGroup?: ClassGroup
  classType: 'semester' | 'group'
  onChange: (updates: Partial<ClassGroup>) => void
  onCampusChange: (newCampus: string, confirmed: boolean) => void
  onCreateClass?: (classGroup: ClassGroup) => void
}

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: '中文', label: '中文' },
  { value: '德文', label: '德文' },
  { value: '日文', label: '日文' },
  { value: '法文', label: '法文' },
  { value: '英文', label: '英文' },
  { value: '西文', label: '西文' },
  { value: '韓文', label: '韓文' },
  { value: '台語', label: '台語' },
  { value: '粵語', label: '粵語' },
]

interface CreateFormData {
  name: string
  materials: string[]
  campusId: string
  language: Language
  minStudents: number
  maxStudents: number
}

const ClassSettingsPanel: React.FC<ClassSettingsPanelProps> = ({
  classGroup,
  classType,
  onChange,
  onCampusChange,
  onCreateClass,
}) => {
  const { formatMessage } = useIntl()
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [pendingCampus, setPendingCampus] = useState<string | null>(null)

  // Get campuses from permission groups
  const { campuses } = usePermissionGroupsAsCampuses()
  const { createClassGroup } = useCreateClassGroup()
  const defaultCampusId = campuses[0]?.id || ''

  // Get orders to extract material options
  const { orders } = useOrdersByIds(classGroup?.orderIds || [])

  // Extract material options from order products
  const materialOptions = useMemo(() => {
    const materials = new Set<string>()
    orders.forEach(order => {
      order.order_products?.forEach((product: any) => {
        // Check if options.options.product === '教材'
        const options = product.options
        if (options?.options?.product === '教材' && options?.title) {
          materials.add(options.title)
        }
      })
    })
    return Array.from(materials)
  }, [orders])

  // Local state for create mode only
  const [createFormData, setCreateFormData] = useState<CreateFormData>({
    name: '',
    materials: [],
    campusId: defaultCampusId,
    language: '中文',
    minStudents: 3,
    maxStudents: 15,
  })
  const [customMaterialName, setCustomMaterialName] = useState('')

  const isCreateMode = !classGroup

  // Get current display data
  const currentData = isCreateMode
    ? createFormData
    : {
        name: classGroup.name,
        materials: classGroup.materials,
        campusId: classGroup.campusId,
        language: classGroup.language,
        minStudents: classGroup.minStudents,
        maxStudents: classGroup.maxStudents,
      }

  useEffect(() => {
    const customMaterial = currentData.materials.find(
      m => m !== '尚未決定' && m !== '自選教材' && !materialOptions.includes(m),
    )
    setCustomMaterialName(customMaterial || '')
  }, [currentData.materials, materialOptions])

  const handleFieldChange = useCallback(
    (field: keyof CreateFormData, value: any) => {
      if (isCreateMode) {
        setCreateFormData(prev => ({ ...prev, [field]: value }))
      } else {
        onChange({ [field]: value })
      }
    },
    [isCreateMode, onChange],
  )

  const handleMaterialsChange = useCallback(
    (values: string[]) => {
      const includesCustom = values.includes('自選教材')
      const filteredValues = values.filter(v => v !== customMaterialName)
      handleFieldChange('materials', includesCustom ? values : filteredValues)
      if (!includesCustom && customMaterialName && !values.includes(customMaterialName)) {
        setCustomMaterialName('')
      }
    },
    [customMaterialName, handleFieldChange],
  )

  const handleCustomMaterialChange = useCallback(
    (value: string) => {
      setCustomMaterialName(value)
      const baseMaterials = currentData.materials.filter(m => m !== '自選教材' && m !== customMaterialName)
      const nextMaterials = value ? [...baseMaterials, value] : baseMaterials
      handleFieldChange('materials', nextMaterials)
    },
    [currentData.materials, customMaterialName, handleFieldChange],
  )

  const handleCampusChange = useCallback(
    (newCampus: string) => {
      if (isCreateMode) {
        setCreateFormData(prev => ({ ...prev, campusId: newCampus }))
      } else if (classGroup && classGroup.campusId !== newCampus) {
        setPendingCampus(newCampus)
        setConfirmModalVisible(true)
      } else {
        onCampusChange(newCampus, true)
      }
    },
    [isCreateMode, classGroup, onCampusChange],
  )

  const handleConfirmCampusChange = useCallback(() => {
    if (pendingCampus) {
      onCampusChange(pendingCampus, true)
      setConfirmModalVisible(false)
      setPendingCampus(null)
    }
  }, [pendingCampus, onCampusChange])

  const handleCancelCampusChange = useCallback(() => {
    setConfirmModalVisible(false)
    setPendingCampus(null)
  }, [])

  const handleCreateClass = useCallback(async () => {
    if (!createFormData.name.trim()) {
      return
    }

    try {
      const newClass = await createClassGroup({
        name: createFormData.name,
        type: classType,
        campusId: createFormData.campusId,
        language: createFormData.language,
        minStudents: createFormData.minStudents,
        maxStudents: createFormData.maxStudents,
        materials: createFormData.materials,
        status: 'draft',
      })

      // Reset form after creation
      setCreateFormData({
        name: '',
        materials: [],
        campusId: defaultCampusId,
        language: '中文',
        minStudents: 3,
        maxStudents: 15,
      })

      if (onCreateClass) {
        onCreateClass(newClass)
      }
    } catch (error) {
      console.error('Failed to create class group:', error)
    }
  }, [createFormData, classType, defaultCampusId, onCreateClass, createClassGroup])

  const cardTitle = (
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <span>{classType === 'group' ? '小組班基本設定' : formatMessage(scheduleMessages.ClassSettings.title)}</span>
      {isCreateMode && (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleCreateClass}
          disabled={!createFormData.name.trim()}
        >
          {formatMessage(scheduleMessages.SemesterClass.createClass)}
        </Button>
      )}
    </Space>
  )

  return (
    <>
      <ScheduleCard size="small" title={cardTitle}>
        <Form layout="vertical" size="middle">
          {/* Row 1: 學期班名稱 */}
          <Form.Item label={formatMessage(scheduleMessages.ClassSettings.className)}>
            <Input
              value={currentData.name}
              onChange={e => handleFieldChange('name', e.target.value)}
              placeholder="班級名稱"
            />
          </Form.Item>

          {/* Row 2: 教材 */}
          <Form.Item label={formatMessage(scheduleMessages.ClassSettings.materials)}>
            <Select
              mode="multiple"
              value={currentData.materials}
              onChange={handleMaterialsChange}
              style={{ width: '100%' }}
              placeholder="選擇教材"
              showSearch
              optionFilterProp="children"
            >
              {materialOptions.map(m => (
                <Select.Option key={m} value={m}>
                  {m}
                </Select.Option>
              ))}
              <Select.Option value="自選教材">自選教材</Select.Option>
              <Select.Option value="尚未決定">尚未決定</Select.Option>
            </Select>
            {(currentData.materials.includes('自選教材') || customMaterialName) && (
              <Input
                value={customMaterialName}
                onChange={e => handleCustomMaterialChange(e.target.value)}
                placeholder="輸入自選教材名稱"
                style={{ marginTop: 8 }}
              />
            )}
          </Form.Item>

          {/* Row 3: 校區、教授語言 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={formatMessage(scheduleMessages.ClassSettings.campus)}>
                <Select value={currentData.campusId ?? undefined} onChange={handleCampusChange} style={{ width: '100%' }}>
                  {campuses.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={formatMessage(scheduleMessages.ClassSettings.language)}>
                <Select
                  value={currentData.language}
                  onChange={(val: Language) => handleFieldChange('language', val)}
                  style={{ width: '100%' }}
                >
                  {LANGUAGE_OPTIONS.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Row 4: 成班人數、滿班人數 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={formatMessage(scheduleMessages.ClassSettings.minStudents)}>
                <InputNumber
                  value={currentData.minStudents}
                  onChange={val => handleFieldChange('minStudents', val || 1)}
                  min={1}
                  max={currentData.maxStudents}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={formatMessage(scheduleMessages.ClassSettings.maxStudents)}>
                <InputNumber
                  value={currentData.maxStudents}
                  onChange={val => handleFieldChange('maxStudents', val || 1)}
                  min={currentData.minStudents}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </ScheduleCard>

      {/* Campus Change Confirmation Modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            確認變更校區
          </span>
        }
        visible={confirmModalVisible}
        onOk={handleConfirmCampusChange}
        onCancel={handleCancelCampusChange}
        okText={formatMessage(scheduleMessages['*'].confirm)}
        cancelText={formatMessage(scheduleMessages['*'].cancel)}
      >
        <Typography.Text>{formatMessage(scheduleMessages.ClassSettings.campusChangeWarning)}</Typography.Text>
      </Modal>
    </>
  )
}

export default ClassSettingsPanel
