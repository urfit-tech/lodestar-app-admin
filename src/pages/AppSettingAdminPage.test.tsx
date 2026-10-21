import { useMutation, useQuery } from '@apollo/client'
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import AppSettingAdminPage from './AppSettingAdminPage'

jest.mock('@apollo/client', () => ({
  ...require('@jest/globals').jest.requireActual('@apollo/client'),
  useQuery: require('@jest/globals').jest.fn(),
  useMutation: require('@jest/globals').jest.fn(),
}))
jest.mock('lodestar-app-element/src/contexts/AuthContext', () => ({
  useAuth: () => ({ currentUserRole: 'app-owner', permissions: { APP_SETTING_ADMIN: true } }),
}))
jest.mock('lodestar-app-element/src/contexts/AppContext', () => ({
  useApp: () => ({
    id: 'app',
    settings: { 'feature.existing': 'old', 'feature.membership_default_permission': 'protected' },
  }),
}))
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({ formatMessage: (descriptor: { id: string }) => descriptor.id }),
}))
jest.mock('../helpers', () => ({ handleError: require('@jest/globals').jest.fn() }))
jest.mock('../components/admin', () => ({ AdminPageTitle: ({ children }: any) => children }))
jest.mock(
  '../components/admin/AdminCard',
  () =>
    ({ children }: any) =>
      children,
)
jest.mock(
  '../components/layout/AdminLayout',
  () =>
    ({ children }: any) =>
      children,
)
jest.mock('./ForbiddenPage', () => () => null)

let container: HTMLDivElement
let mutate: ReturnType<typeof jest.fn>
beforeEach(() => {
  window.matchMedia = jest
    .fn()
    .mockImplementation(() => ({ matches: false, addListener: jest.fn(), removeListener: jest.fn() })) as any
  container = document.createElement('div')
  document.body.appendChild(container)
  mutate = jest
    .fn()
    .mockImplementation(({ variables }: any) =>
      Promise.resolve({ data: { insert_app_setting: { affected_rows: variables.appSettings.length } } }),
    )
  ;(useMutation as ReturnType<typeof jest.fn>).mockReturnValue([mutate])
  ;(useQuery as ReturnType<typeof jest.fn>).mockReturnValue({
    data: {
      setting: ['feature.existing', 'feature.optional', 'feature.membership_default_permission'].map(key => ({
        key,
        type: 'string',
        options: null,
        is_protected: false,
        is_required: false,
        app_settings: [],
      })),
    },
  })
  act(() => {
    render(<AppSettingAdminPage />, container)
  })
})
afterEach(() => {
  act(() => {
    unmountComponentAtNode(container)
  })
  container.remove()
})
const input = (key: string) => container.querySelector(`input[id="${key}"]`) as HTMLInputElement
const change = (key: string, value: string) =>
  act(() => {
    Simulate.change(input(key), { target: { value } } as any)
  })
const cancel = () =>
  act(() => {
    Simulate.click(container.querySelector('button') as HTMLButtonElement)
  })
const save = async () => {
  await act(async () => {
    Simulate.submit(container.querySelector('form') as HTMLFormElement)
  })
}

test('cancel clears an unsaved key so saving another field never persists the cancelled value', async () => {
  change('feature.optional', 'discard this')
  cancel()
  expect(input('feature.optional').value).toBe('')
  change('feature.existing', 'new')
  await save()
  expect(mutate).toHaveBeenCalledTimes(1)
  expect(mutate.mock.calls[0][0]).toEqual({
    variables: { appSettings: [{ app_id: 'app', key: 'feature.existing', value: 'new' }] },
  })
  expect(input('feature.membership_default_permission').disabled).toBe(true)
})

test('cancel restores the latest successful save and leaves no changed keys to send', async () => {
  change('feature.existing', 'saved')
  await save()
  change('feature.existing', 'discard this')
  change('feature.optional', 'discard this too')
  cancel()
  expect(input('feature.existing').value).toBe('saved')
  expect(input('feature.optional').value).toBe('')
  await save()
  expect(mutate).toHaveBeenCalledTimes(1)
})
