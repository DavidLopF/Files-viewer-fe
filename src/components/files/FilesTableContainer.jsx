import { useCallback } from 'react'
import { useFilesData } from '../../hooks/useFilesData'
import { useFileNameFilter } from '../../hooks/useFileNameFilter'
import { STATUS } from '../../store/filesSlice'
import Loader from '../common/Loader'
import ErrorAlert from '../common/ErrorAlert'
import EmptyState from '../common/EmptyState'
import SkippedFilesNotice from '../common/SkippedFilesNotice'
import FilesTable from './FilesTable'
import FileRow from './FileRow'
import FileFilterBar from './FileFilterBar'

/**
 * Connects the files table to the Redux store and decides which of the
 * four mutually exclusive views (loading / error / empty / success) to
 * render based on the fetch state machine.
 */
const FilesTableContainer = () => {
  const { status, error, rows, skippedFiles, skippedFileNames, retry } = useFilesData()
  const {
    availableFiles,
    searchText,
    activeFileName,
    onSearchTextChange,
    onSearchSubmit,
    onFileNameSelect,
    onClear
  } = useFileNameFilter()

  const renderRow = useCallback((row, key) => <FileRow key={key} row={row} />, [])

  const renderContent = () => {
    switch (status) {
      case STATUS.LOADING:
        return <Loader />
      case STATUS.ERROR:
        return <ErrorAlert message={error.message} onRetry={retry} />
      case STATUS.SUCCESS:
        return rows.length === 0
          ? <EmptyState />
          : <FilesTable rows={rows} renderRow={renderRow} />
      default:
        return null
    }
  }

  return (
    <>
      <FileFilterBar
        searchText={searchText}
        onSearchTextChange={onSearchTextChange}
        onSearchSubmit={onSearchSubmit}
        availableFiles={availableFiles}
        activeFileName={activeFileName}
        onFileNameSelect={onFileNameSelect}
        onClear={onClear}
      />
      <SkippedFilesNotice count={skippedFiles} names={skippedFileNames} />
      <div aria-live='polite'>
        {renderContent()}
      </div>
    </>
  )
}

export default FilesTableContainer
