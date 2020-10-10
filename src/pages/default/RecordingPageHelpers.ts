import axios from 'axios'

export async function appendPodcastProgramAduio(
  appId: string,
  podcastProgramId: string,
  key: string,
  filename: string,
  duration: number,
  authToken: string | null,
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
