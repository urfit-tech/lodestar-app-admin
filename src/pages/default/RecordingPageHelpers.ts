import axios from 'axios'

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
