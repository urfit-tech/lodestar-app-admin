import axios from 'axios'

export async function exportPodcastProgram(
  authToken: string | null,
  appId: string,
  podcastProgramId: string,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_API_BASE_ROOT}/podcast/export`,
    {
      appId,
      podcastProgramId,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
}

export async function mergePodcastProgram(
  authToken: string | null,
  appId: string,
  podcastProgramId: string,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_API_BASE_ROOT}/podcast/merge`,
    {
      appId,
      podcastProgramId,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
}

export async function appendPodcastProgramAudio(
  authToken: string | null,
  appId: string,
  podcastProgramId: string,
  key: string,
  filename: string,
  duration: number,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_API_BASE_ROOT}/podcast/append`,
    {
      appId,
      podcastProgramId,
      key,
      filename,
      duration,
    },
    { headers: { authorization: `Bearer ${authToken}` } },
  )
}

export async function splitPodcastProgramAudio(
  authToken: string | null,
  appId: string,
  podcastProgramAudioId: string,
  atSec: number,
  options?: { filenames: string[] },
): Promise<string[]> {
  const resp = await axios.post(
    `${process.env.REACT_APP_API_BASE_ROOT}/podcast/split`,
    {
      appId,
      podcastProgramAudioId,
      atSec,
      options,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )

  return resp.data.result.ids
}

export async function movePodcastProgramAudio(
  authToken: string | null,
  appId: string,
  podcastProgramAudioId: string,
  toPosition: number,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_API_BASE_ROOT}/podcast/move`,
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

export async function deletePodcastProgramAudio(
  authToken: string | null,
  appId: string,
  podcastProgramAudioId: string,
): Promise<void> {
  await axios.post(
    `${process.env.REACT_APP_API_BASE_ROOT}/podcast/delete`,
    {
      appId,
      podcastProgramAudioId,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
}
