import axios from 'axios'
import { getResourceByTypeTargetFetcher, createInvitationFetcher } from './eventFetchers'

jest.mock('axios')
jest.mock('lodestar-app-element/src/helpers/adaptObject', () => ({ renameKey: jest.fn() }))
const post = axios.post as jest.MockedFunction<typeof axios.post>

afterEach(() => jest.clearAllMocks())

it('returns resource records through the existing curried API', async () => {
  const records = [
    { temporally_exclusive_resource_id: 'resource', type: 'member', name: 'Teacher', permission_group_ids: [] },
  ]
  post.mockResolvedValueOnce({ data: records })
  await expect(getResourceByTypeTargetFetcher('test-token')({ type: 'member', targets: ['member'] })).resolves.toEqual(
    records,
  )
  expect(post.mock.calls[0][1]).toEqual(['member'])
})

it('preserves role-bearing invitation payloads without requiring fetched display metadata', async () => {
  const resources = [{ temporally_exclusive_resource_id: 'resource', role: 'host' }]
  post.mockResolvedValueOnce({ data: { success: true } })
  await createInvitationFetcher('test-token')(resources)([{ id: 'event' }])
  expect(post.mock.calls[0][1]).toEqual({ eventResources: resources, eventIds: ['event'] })
})

it('propagates resource-fetch errors to the caller', async () => {
  post.mockRejectedValueOnce(new Error('network failed'))
  await expect(getResourceByTypeTargetFetcher('test-token')({ type: 'member', targets: ['member'] })).rejects.toThrow(
    'network failed',
  )
})
