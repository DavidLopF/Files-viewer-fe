import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchFilesData as fetchFilesDataRequest } from '../services/filesApi'

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

const initialState = {
  status: STATUS.IDLE,
  files: [],
  skippedFiles: 0,
  skippedFileNames: [],
  fileName: '',
  searchText: '',
  error: null,
  currentRequestId: null
}

/**
 * Fetches file data from the API, optionally scoped to a file name search,
 * and replaces whatever the slice currently holds.
 */
export const fetchFilesData = createAsyncThunk(
  'files/fetchFilesData',
  async ({ fileName } = {}) => {
    const { files, skippedFiles, skippedFileNames } = await fetchFilesDataRequest({ fileName })
    return { files, skippedFiles, skippedFileNames, fileName: fileName || '' }
  }
)

/**
 * Live search dispatches requests faster than the network can guarantee
 * ordering: a request for "test" can resolve after one for "test1" fired
 * later. Only the outcome of the most recently dispatched request is ever
 * applied; anything else is a stale response and is dropped.
 */
const isStaleAction = (state, action) => action.meta.requestId !== state.currentRequestId

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setSearchText (state, action) {
      state.searchText = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilesData.pending, (state, action) => {
        state.status = STATUS.LOADING
        state.error = null
        state.currentRequestId = action.meta.requestId
      })
      .addCase(fetchFilesData.fulfilled, (state, action) => {
        if (isStaleAction(state, action)) return
        state.status = STATUS.SUCCESS
        state.files = action.payload.files
        state.skippedFiles = action.payload.skippedFiles
        state.skippedFileNames = action.payload.skippedFileNames
        state.fileName = action.payload.fileName
      })
      .addCase(fetchFilesData.rejected, (state, action) => {
        if (isStaleAction(state, action)) return
        state.status = STATUS.ERROR
        state.error = action.error.code
          ? { code: action.error.code, message: action.error.message }
          : { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado' }
      })
  }
})

export const { setSearchText } = filesSlice.actions
export default filesSlice.reducer
