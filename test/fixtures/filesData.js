const fullDataset = [
  {
    file: 'test1.csv',
    lines: [
      { text: 'RgTya', number: 64075909, hex: '70ad29aacf0b690b0467fe2b2767f765' },
      { text: 'mNBvcx', number: 12345678, hex: '1a2b3c4d5e6f70819203a4b5c6d7e8f9' }
    ]
  },
  {
    file: 'test2.csv',
    lines: [
      { text: 'QweRty', number: 987654, hex: 'ffeeddccbbaa99887766554433221100' }
    ]
  },
  {
    file: 'empty.csv',
    lines: []
  }
]

const filesList = ['test1.csv', 'test2.csv', 'empty.csv']

module.exports = {
  fullDataset,
  filesList
}
