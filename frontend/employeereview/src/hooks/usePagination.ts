import { useState } from 'react'

/** Tracks a page and calculates which items to show from a loaded list. */
export function usePagination(totalItems: number, pageSize = 5) {
  const [selectedPage, setSelectedPage] = useState(1)
  const totalPages = Math.ceil(totalItems / pageSize)
  const currentPage = Math.min(selectedPage, Math.max(totalPages, 1))
  const startIndex = (currentPage - 1) * pageSize

  const goToPage = (page: number) => {
    const lastPage = Math.max(totalPages, 1)
    setSelectedPage(Math.min(Math.max(page, 1), lastPage))
  }

  const resetPage = () => setSelectedPage(1)

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    startItem: totalItems === 0 ? 0 : startIndex + 1,
    endItem: Math.min(startIndex + pageSize, totalItems),
    resetPage,
    goToPage,
  }
}
