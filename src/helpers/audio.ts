import { AudioContext, OfflineAudioContext } from 'standardized-audio-context'
import toWav from 'audiobuffer-to-wav'
const lamejs = require('lamejs')

/**
 * detect if a file is an audio.
 * @param {File} file
 */
export const isAudio = (file: File) => file.type.indexOf('audio') > -1

/**
 * create range [min .. max]
 */
export const range = (min: number, max: number) =>
  Array.apply<null, { length: number } | any, unknown[]>(null, { length: max - min + 1 }).map((v, i) => i + min)

type DataTypeProps = 'readAsArrayBuffer' | 'readAsBinaryString' | 'readAsDataURL' | 'readAsText'

/**
 * FileReader via promise
 * @param {File} file
 * @param {string} dataType
 * @return {Promise<ArrayBuffer | string>}
 */
export const readFile: (file: File, dataType: string) => Promise<ArrayBuffer | string | null> = (file, dataType) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader[('readAs' + dataType) as DataTypeProps](file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = err => reject(err)
  })

/**
 * Read File/Blob to ArrayBuffer
 * @param {File} file
 * @return {Promise<ArrayBuffer>}
 */
export const readArrayBuffer: (file: File) => Promise<ArrayBuffer | null> = file =>
  readFile(file, 'ArrayBuffer') as Promise<ArrayBuffer | null>

/**
 * Read File/Blob to Base64
 * @param {File} file
 * @return {Promise<string>}
 */
export const readDataURL = (file: File) => readFile(file, 'DataURL')

export const readBlobURL = (file: File) => URL.createObjectURL(file)

export const download = (url: string, name: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
}

export const rename = (filename: string, ext: string, stamp: string) =>
  `${filename.replace(/\.\w+$/, '')}${stamp || ''}.${ext}`

/**
 * format seconds to [minutes, integer, decimal(2)]
 * @param {number} seconds
 */
export const formatSeconds = (seconds: number) => [
  Math.floor(seconds / 60),
  Math.floor(seconds % 60),
  Math.round((seconds % 1) * 100),
]

/**
 * decode arrayBuffer of audio file to AudioBuffer
 * @param {ArrayBuffer} arrayBuffer
 * @return {Promise<AudioBuffer>}
 * @deprecated use AudioContext.decodeAudioData directly
 */
export function decodeAudioArrayBuffer(arrayBuffer: ArrayBuffer) {
  return new AudioContext().decodeAudioData(arrayBuffer)
}

/**
 * slice AudioBuffer from start byte to end byte
 * @param {AudioBuffer} audioBuffer
 * @return {AudioBuffer}
 */
export function sliceAudioBuffer(audioBuffer: AudioBuffer, start = 0, end = audioBuffer.length) {
  const newBuffer = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    end - start,
    audioBuffer.sampleRate,
  ).createBuffer(audioBuffer.numberOfChannels, end - start, audioBuffer.sampleRate)

  for (var i = 0; i < audioBuffer.numberOfChannels; i++) {
    newBuffer.copyToChannel(audioBuffer.getChannelData(i).slice(start, end), i)
  }

  return newBuffer
}

/**
 * merge two AudioBuffer into one
 * @param {AudioBuffer} audioBuffer1
 * @param {AudioBuffer} audioBuffer2
 * @return {AudioBuffer}
 */
export function mergeAudioBuffer(audioBuffer1: AudioBuffer, audioBuffer2: AudioBuffer) {
  if (
    audioBuffer1.numberOfChannels !== audioBuffer2.numberOfChannels ||
    audioBuffer1.sampleRate !== audioBuffer2.sampleRate
  ) {
    return null
  }
  const newBuffer = new OfflineAudioContext(
    audioBuffer1.numberOfChannels,
    audioBuffer1.length + audioBuffer2.length,
    audioBuffer1.sampleRate,
  ).createBuffer(audioBuffer1.numberOfChannels, audioBuffer1.length + audioBuffer2.length, audioBuffer1.sampleRate)

  for (var i = 0; i < newBuffer.numberOfChannels; i++) {
    const data = newBuffer.getChannelData(i)
    data.set(audioBuffer1.getChannelData(i))
    data.set(audioBuffer2.getChannelData(i), audioBuffer1.length)
  }

  return newBuffer
}

/**
 * serialize AudioBuffer for message send
 * @param {AudioBuffer} audioBuffer
 */
export function serializeAudioBuffer(audioBuffer: AudioBuffer) {
  return {
    channels: range(0, audioBuffer.numberOfChannels - 1).map(i => audioBuffer.getChannelData(i)),
    sampleRate: audioBuffer.sampleRate,
    length: audioBuffer.length,
  }
}

export const decodeAudio = async (blob: File) => {
  const _arrayBuffer = await readArrayBuffer(blob)
  const _audioBuffer = _arrayBuffer ? await new AudioContext().decodeAudioData(_arrayBuffer) : null

  return _audioBuffer
}

export const convertAudioBufferToMp3 = (audioBuffer: AudioBuffer, kbps = 128) => {
  const wav = toWav(audioBuffer)
  const wavData = lamejs.WavHeader.readHeader(new DataView(wav))
  const samples = new Int16Array(wav, wavData.dataOffset, wavData.dataLen / 2)
  const sampleBlockSize = 1152
  const mp3encoder = new lamejs.Mp3Encoder(wavData.channels, wavData.sampleRate, kbps)
  const mp3Data = []
  for (var i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize)
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk)
    if (mp3buf.length > 0) {
      mp3Data.push(Buffer.from(mp3buf))
    }
  }
  const mp3buf = mp3encoder.flush()
  if (mp3buf.length > 0) {
    mp3Data.push(Buffer.from(mp3buf))
  }

  return Buffer.concat(mp3Data)
}
