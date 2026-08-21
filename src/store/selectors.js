import { createSelector } from '@reduxjs/toolkit'
import { flattenFilesData } from '../utils/flattenFilesData'

export const selectStatus = (state) => state.files.status
export const selectError = (state) => state.files.error
export const selectSkippedFiles = (state) => state.files.skippedFiles
export const selectSkippedFileNames = (state) => state.files.skippedFileNames
export const selectFileName = (state) => state.files.fileName
export const selectSearchText = (state) => state.files.searchText

const selectRawFiles = (state) => state.files.files

/**
 * Rows visible in the table: the API already returns exactly the dataset
 * that was requested (all files, or one exact file name), so this only
 * flattens it, it never re-filters it.
 */
export const selectRows = createSelector(selectRawFiles, flattenFilesData)
