import axios from 'axios'
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config'

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS
})

/**
 * Normalizes any axios failure into a plain object the rest of the app can
 * rely on, regardless of whether the API responded with a structured error,
 * responded with something unexpected, or never responded at all.
 * @param {import('axios').AxiosError} axiosError
 * @returns {{ code: string, message: string }}
 */
const normalizeError = (axiosError) => {
  const apiError = axiosError.response && axiosError.response.data && axiosError.response.data.error

  if (apiError) {
    return { code: apiError.code, message: apiError.message }
  }

  if (axiosError.response) {
    return { code: 'INTERNAL_ERROR', message: 'El servidor devolvió un error inesperado' }
  }

  return { code: 'NETWORK_ERROR', message: 'No se pudo contactar al servidor. Verifica tu conexión e intenta de nuevo' }
}

/**
 * Parses the `X-Skipped-File-Names` header, a JSON-encoded array. Falls
 * back to an empty list if the header is missing or malformed, since it's
 * supplementary detail for `skippedFiles`, not something the UI depends on.
 * @param {string | undefined} header
 * @returns {string[]}
 */
const parseSkippedFileNames = (header) => {
  if (!header) return []
  try {
    const parsed = JSON.parse(header)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Fetches flattened file data from the API, optionally scoped to a single file.
 * @param {{ fileName?: string }} [params]
 * @returns {Promise<{ files: Array, skippedFiles: number, skippedFileNames: string[] }>}
 */
export const fetchFilesData = async (params = {}) => {
  try {
    const response = await httpClient.get('/files/data', {
      params: params.fileName ? { fileName: params.fileName } : undefined
    })

    const skippedFiles = Number(response.headers['x-skipped-files']) || 0
    const skippedFileNames = parseSkippedFileNames(response.headers['x-skipped-file-names'])

    return { files: response.data, skippedFiles, skippedFileNames }
  } catch (error) {
    throw normalizeError(error)
  }
}

/**
 * Fetches the list of available file names.
 * @returns {Promise<string[]>}
 */
export const fetchFilesList = async () => {
  try {
    const response = await httpClient.get('/files/list')
    return response.data.files
  } catch (error) {
    throw normalizeError(error)
  }
}
