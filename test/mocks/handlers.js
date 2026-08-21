const { rest } = require('msw')
const { fullDataset, filesList } = require('../fixtures/filesData')

const API_BASE_URL = 'http://localhost:3000'

const handlers = [
  rest.get(`${API_BASE_URL}/files/list`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ files: filesList }))
  }),

  rest.get(`${API_BASE_URL}/files/data`, (req, res, ctx) => {
    const fileName = req.url.searchParams.get('fileName')

    if (!fileName) {
      return res(
        ctx.status(200),
        ctx.set('X-Skipped-Files', '0'),
        ctx.set('X-Skipped-File-Names', '[]'),
        ctx.json(fullDataset)
      )
    }

    const needle = fileName.toLowerCase()
    const matches = fullDataset.filter((entry) => entry.file.toLowerCase().includes(needle))

    if (matches.length === 0) {
      return res(
        ctx.status(404),
        ctx.json({ error: { code: 'FILE_NOT_FOUND', message: `File '${fileName}' was not found` } })
      )
    }

    return res(
      ctx.status(200),
      ctx.set('X-Skipped-Files', '0'),
      ctx.set('X-Skipped-File-Names', '[]'),
      ctx.json(matches)
    )
  })
]

module.exports = { handlers }
