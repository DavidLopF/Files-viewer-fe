import { flattenFilesData } from './flattenFilesData'

describe('flattenFilesData', () => {
  it('produces one row per line, repeating the file name', () => {
    const input = [
      {
        file: 'test1.csv',
        lines: [
          { text: 'RgTya', number: 64075909, hex: '70ad29aacf0b690b0467fe2b2767f765' },
          { text: 'mNBvcx', number: 12345678, hex: '1a2b3c4d5e6f70819203a4b5c6d7e8f9' }
        ]
      }
    ]

    expect(flattenFilesData(input)).toEqual([
      { file: 'test1.csv', text: 'RgTya', number: 64075909, hex: '70ad29aacf0b690b0467fe2b2767f765' },
      { file: 'test1.csv', text: 'mNBvcx', number: 12345678, hex: '1a2b3c4d5e6f70819203a4b5c6d7e8f9' }
    ])
  })

  it('skips files whose lines array is empty', () => {
    const input = [{ file: 'empty.csv', lines: [] }]

    expect(flattenFilesData(input)).toEqual([])
  })

  it('returns an empty array when given an empty array', () => {
    expect(flattenFilesData([])).toEqual([])
  })

  it('keeps rows grouped correctly across multiple files', () => {
    const input = [
      { file: 'a.csv', lines: [{ text: 'A', number: 1, hex: 'aa' }] },
      { file: 'b.csv', lines: [] },
      {
        file: 'c.csv',
        lines: [
          { text: 'C1', number: 2, hex: 'cc1' },
          { text: 'C2', number: 3, hex: 'cc2' }
        ]
      }
    ]

    expect(flattenFilesData(input)).toEqual([
      { file: 'a.csv', text: 'A', number: 1, hex: 'aa' },
      { file: 'c.csv', text: 'C1', number: 2, hex: 'cc1' },
      { file: 'c.csv', text: 'C2', number: 3, hex: 'cc2' }
    ])
  })
})
