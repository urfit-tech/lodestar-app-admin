import axios from 'axios'

export async function exportPodcastProgram(
  authToken: string | null,
  appId: string,
  podcastProgramId: string,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_BACKEND_ENDPOINT}/podcast/export`,
    {
      appId,
      podcastProgramId,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
}

export async function appendPodcastProgramAduio(
  authToken: string | null,
  appId: string,
  podcastProgramId: string,
  key: string,
  filename: string,
  duration: number,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_BACKEND_ENDPOINT}/podcast/append`,
    {
      appId,
      podcastProgramId,
      key,
      filename,
      duration,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
}

export async function splitPodcastProgramAduio(
  authToken: string | null,
  appId: string,
  podcastProgramAudioId: string,
  atSec: number,
): Promise<string[]> {
  const resp = await axios.post(
    `${process.env.REACT_APP_BACKEND_ENDPOINT}/podcast/split`,
    {
      appId,
      podcastProgramAudioId,
      atSec,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )

  return resp.data.result.ids
}

export async function movePodcastProgramAduio(
  authToken: string | null,
  appId: string,
  podcastProgramAudioId: string,
  toPosition: number,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_BACKEND_ENDPOINT}/podcast/move`,
    {
      appId,
      podcastProgramAudioId,
      toPosition,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
}

export async function deletePodcastProgramAduio(
  authToken: string | null,
  appId: string,
  podcastProgramAudioId: string,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_BACKEND_ENDPOINT}/podcast/delete`,
    {
      appId,
      podcastProgramAudioId,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
}
