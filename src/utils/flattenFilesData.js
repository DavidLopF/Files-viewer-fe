/**
 * Flattens the API's per-file/per-line structure into a flat list of table
 * rows, repeating the file name on every row it owns.
 * @param {Array<{ file: string, lines: Array<{ text: string, number: number, hex: string }> }>} filesData
 * @returns {Array<{ file: string, text: string, number: number, hex: string }>}
 */
export const flattenFilesData = (filesData) =>
  filesData.reduce((rows, entry) => {
    const fileRows = entry.lines.map((line) => ({ file: entry.file, ...line }))
    return rows.concat(fileRows)
  }, [])
