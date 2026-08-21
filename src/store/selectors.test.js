import { selectRows } from './selectors'

const buildState = (files) => ({
  files: {
    status: 'success',
    files,
    skippedFiles: 0,
    fileName: '',
    searchText: '',
    error: null
  }
})

describe('selectRows', () => {
  it('flattens the raw dataset from the store', () => {
    const files = [
      { file: 'test1.csv', lines: [{ text: 'A', number: 1, hex: 'aa' }] },
      { file: 'test2.csv', lines: [{ text: 'B', number: 2, hex: 'bb' }] }
    ]

    expect(selectRows(buildState(files))).toEqual([
      { file: 'test1.csv', text: 'A', number: 1, hex: 'aa' },
      { file: 'test2.csv', text: 'B', number: 2, hex: 'bb' }
    ])
  })

  it('returns an empty array when the store holds no files', () => {
    expect(selectRows(buildState([]))).toEqual([])
  })

  it('skips files whose lines array is empty', () => {
    const files = [{ file: 'empty.csv', lines: [] }]

    expect(selectRows(buildState(files))).toEqual([])
  })
})
