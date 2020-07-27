import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Button, Input, message } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useAppData, useUpdateAppSettings } from '../../hooks/app'
import AdminCard from '../admin/AdminCard'
import { StyledForm } from '../layout'
import { AppCardProps } from './AppBasicCard'

const messages = defineMessages({
  appTitle: { id: 'app.label.title', defaultMessage: '網站標題' },
  appDescription: { id: 'app.label.description', defaultMessage: '網站敘述' },
  ogTitle: { id: 'app.label.ogTitle', defaultMessage: 'Open Graph 網站標題' },
  ogDescription: { id: 'app.label.ogDescription', defaultMessage: 'Open Graph 網站敘述' },
  ogUrl: { id: 'app.label.ogUrl', defaultMessage: 'Open Graph 網址' },
  ogImage: { id: 'app.label.ogImage', defaultMessage: 'Open Graph 網站圖片' },
  seoName: { id: 'app.label.seoName', defaultMessage: 'SEO 網站名稱' },
  seoUrl: { id: 'app.label.seoUrl', defaultMessage: 'SEO 網址' },

  gaId: { id: 'app.label.gaId', defaultMessage: 'Google Analytics ID' },
  gtmId: { id: 'app.label.gtmId', defaultMessage: 'Google Tag Manager ID' },
  fbPixelId: { id: 'app.label.fbPixelId', defaultMessage: 'Facebook Pixel ID' },

  tappayAppId: { id: 'app.label.tappayAppId', defaultMessage: 'Tappay ID' },
  tappayAppKey: { id: 'app.label.tappayAppKey', defaultMessage: 'Tappay 金鑰' },
  paymentDueDays: { id: 'app.label.paymentDueDays', defaultMessage: '付款節止天數' },

  themeLayoutBodyBackground: { id: 'app.label.themeLayoutBodyBackground', defaultMessage: '主題色：背景色' },
  themePrimaryColor: { id: 'app.label.themePrimaryColor', defaultMessage: '主題色：主色' },
  themeBtnPrimaryColor: { id: 'app.label.themeBtnPrimaryColor', defaultMessage: '主題色：按鈕主色' },
  themeBtnPrimaryBackground: { id: 'app.label.themeBtnPrimaryBackground', defaultMessage: '主題色：按鈕背景' },
  themeBtnDangerBorder: { id: 'app.label.themeBtnDangerBorder', defaultMessage: '主題色：警示按鈕邊框' },
  themeBtnDangerBackground: { id: 'app.label.themeBtnDangerBackground', defaultMessage: '主題色：警示按鈕背景' },
  themeLayoutHeaderBackground: { id: 'app.label.themeLayoutHeaderBackground', defaultMessage: '主題色：Header背景色' },
})

const AppSettingCard: React.FC<AppCardProps> = ({ form, appId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const { app, refetchApp, loadingApp } = useAppData(appId)
  const updateAppSettings = useUpdateAppSettings()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error && app) {
        setLoading(true)
        const appSettings = Object.keys(values)
          .filter(key => values[key])
          .map(key => ({
            app_id: app.id,
            key,
            value: values[key],
          }))
        setLoading(true)
        updateAppSettings({
          variables: {
            appSettings,
          },
        })
          .then(() => {
            setLoading(false)
            message.success(formatMessage(commonMessages.event.successfullySaved))
            refetchApp()
          })
          .catch(error => handleError(error))
      }
    })
  }

  return (
    <AdminCard {...cardProps} loading={loadingApp}>
      <StyledForm
        onSubmit={handleSubmit}
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 12 } }}
      >
        <Form.Item label={formatMessage(messages.appTitle)}>
          {form.getFieldDecorator('title', {
            initialValue: app && app.settings['title'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.appDescription)}>
          {form.getFieldDecorator('description', {
            initialValue: app && app.settings['description'],
          })(<Input />)}
        </Form.Item>

        <Form.Item label={formatMessage(messages.ogTitle)}>
          {form.getFieldDecorator('open_graph.title', {
            initialValue: app && app.settings['open_graph.title'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.ogDescription)}>
          {form.getFieldDecorator('open_graph.description', {
            initialValue: app && app.settings['open_graph.description'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.ogUrl)}>
          {form.getFieldDecorator('open_graph.url', {
            initialValue: app && app.settings['open_graph.url'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.ogImage)}>
          {form.getFieldDecorator('open_graph.image', {
            initialValue: app && app.settings['open_graph.image'],
          })(<Input />)}
        </Form.Item>

        <Form.Item label={formatMessage(messages.seoName)}>
          {form.getFieldDecorator('seo.name', {
            initialValue: app && app.settings['seo.name'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.seoUrl)}>
          {form.getFieldDecorator('seo.url', {
            initialValue: app && app.settings['seo.url'],
          })(<Input />)}
        </Form.Item>

        <Form.Item label={formatMessage(messages.gtmId)}>
          {form.getFieldDecorator('tracking.gtm_id', {
            initialValue: app && app.settings['tracking.gtm_id'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.gaId)}>
          {form.getFieldDecorator('tracking.ga_id', {
            initialValue: app && app.settings['tracking.ga_id'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.fbPixelId)}>
          {form.getFieldDecorator('tracking.fb_pixel_id', {
            initialValue: app && app.settings['tracking.fb_pixel_id'],
          })(<Input />)}
        </Form.Item>

        <Form.Item label={formatMessage(messages.themeLayoutBodyBackground)}>
          {form.getFieldDecorator('theme.@layout-body-background', {
            initialValue: app && app.settings['theme.@layout-body-background'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.themePrimaryColor)}>
          {form.getFieldDecorator('theme.@primary-color', {
            initialValue: app && app.settings['theme.@primary-color'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeBtnPrimaryColor)}>
          {form.getFieldDecorator('theme.@btn-primary-color', {
            initialValue: app && app.settings['theme.@btn-primary-color'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeBtnPrimaryBackground)}>
          {form.getFieldDecorator('theme.@btn-primary-bg', {
            initialValue: app && app.settings['theme.@btn-primary-bg'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeBtnDangerBorder)}>
          {form.getFieldDecorator('theme.@btn-danger-border', {
            initialValue: app && app.settings['theme.@btn-danger-border'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeBtnDangerBackground)}>
          {form.getFieldDecorator('theme.@btn-danger-bg', {
            initialValue: app && app.settings['theme.@btn-danger-bg'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.themeLayoutHeaderBackground)}>
          {form.getFieldDecorator('theme.@layout-header-background', {
            initialValue: app && app.settings['theme.@layout-header-background'],
          })(<Input />)}
        </Form.Item>

        <Form.Item label={formatMessage(messages.tappayAppId)}>
          {form.getFieldDecorator('tappay.app_id', {
            initialValue: app && app.settings['tappay.app_id'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.tappayAppKey)}>
          {form.getFieldDecorator('tappay.app_key', {
            initialValue: app && app.settings['tappay.app_key'],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.paymentDueDays)}>
          {form.getFieldDecorator('payment.due_days', {
            initialValue: app && app.settings['payment.due_days'],
          })(<Input />)}
        </Form.Item>

        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default Form.create<AppCardProps>()(AppSettingCard)
