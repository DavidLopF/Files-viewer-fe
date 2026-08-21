import reducer, { STATUS, fetchFilesData, setSearchText } from './filesSlice'

describe('filesSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' })

  it('starts in the idle state', () => {
    expect(initialState.status).toBe(STATUS.IDLE)
    expect(initialState.files).toEqual([])
  })

  it('moves to loading on pending and clears any previous error', () => {
    const previousState = { ...initialState, status: STATUS.ERROR, error: { code: 'X', message: 'x' } }
    const state = reducer(previousState, fetchFilesData.pending('requestId', {}))

    expect(state.status).toBe(STATUS.LOADING)
    expect(state.error).toBeNull()
  })

  it('moves to success on fulfilled and replaces the files collection', () => {
    const pendingState = reducer(initialState, fetchFilesData.pending('requestId', {}))
    const payload = {
      files: [{ file: 'a.csv', lines: [] }],
      skippedFiles: 2,
      skippedFileNames: ['b.csv', 'c.csv'],
      fileName: ''
    }
    const state = reducer(pendingState, fetchFilesData.fulfilled(payload, 'requestId', {}))

    expect(state.status).toBe(STATUS.SUCCESS)
    expect(state.files).toEqual(payload.files)
    expect(state.skippedFiles).toBe(2)
    expect(state.skippedFileNames).toEqual(['b.csv', 'c.csv'])
  })

  it('moves to error on rejected and stores the normalized error', () => {
    const pendingState = reducer(initialState, fetchFilesData.pending('requestId', {}))
    const action = fetchFilesData.rejected(
      { code: 'UPSTREAM_ERROR', message: 'Upstream failed' },
      'requestId',
      {}
    )
    const state = reducer(pendingState, action)

    expect(state.status).toBe(STATUS.ERROR)
    expect(state.error).toEqual({ code: 'UPSTREAM_ERROR', message: 'Upstream failed' })
  })

  it('updates the search text without touching the loaded files', () => {
    const state = reducer(initialState, setSearchText('test1'))

    expect(state.searchText).toBe('test1')
    expect(state.files).toEqual(initialState.files)
  })

  it('ignores a fulfilled response from a request that is no longer the latest one', () => {
    let state = reducer(initialState, fetchFilesData.pending('first', {}))
    state = reducer(state, fetchFilesData.pending('second', {}))

    const stalePayload = { files: [{ file: 'stale.csv', lines: [] }], skippedFiles: 0, fileName: '' }
    state = reducer(state, fetchFilesData.fulfilled(stalePayload, 'first', {}))

    expect(state.status).toBe(STATUS.LOADING)
    expect(state.files).toEqual([])
  })

  it('ignores a rejected response from a request that is no longer the latest one', () => {
    let state = reducer(initialState, fetchFilesData.pending('first', {}))
    state = reducer(state, fetchFilesData.pending('second', {}))

    const staleError = fetchFilesData.rejected(
      { code: 'FILE_NOT_FOUND', message: 'stale' },
      'first',
      {}
    )
    state = reducer(state, staleError)

    expect(state.status).toBe(STATUS.LOADING)
    expect(state.error).toBeNull()
  })

  it('applies the latest response even when an older request resolves after it', () => {
    let state = reducer(initialState, fetchFilesData.pending('first', {}))
    state = reducer(state, fetchFilesData.pending('second', {}))

    const latestPayload = { files: [{ file: 'latest.csv', lines: [] }], skippedFiles: 0, fileName: '' }
    state = reducer(state, fetchFilesData.fulfilled(latestPayload, 'second', {}))

    const stalePayload = { files: [{ file: 'stale.csv', lines: [] }], skippedFiles: 0, fileName: '' }
    state = reducer(state, fetchFilesData.fulfilled(stalePayload, 'first', {}))

    expect(state.status).toBe(STATUS.SUCCESS)
    expect(state.files).toEqual(latestPayload.files)
  })
})
