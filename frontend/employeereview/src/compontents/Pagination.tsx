type PaginationProps = {
  currentPage: number
  totalItems: number
  pageSize: number
  itemName?: string
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  itemName = 'items',
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const lastItem = Math.min(currentPage * pageSize, totalItems)

  // Show up to three page numbers, with the current page near the middle.
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 1, totalPages - 2))
  const lastVisiblePage = Math.min(totalPages, firstVisiblePage + 2)
  const visiblePages = Array.from(
    { length: Math.max(0, lastVisiblePage - firstVisiblePage + 1) },
    (_, index) => firstVisiblePage + index,
  )

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) onPageChange(page)
  }

  return (
    <footer className="review-list-footer">
      <span>Showing {firstItem} to {lastItem} of {totalItems} {itemName}</span>
      <nav className="review-pagination" aria-label="Pagination">
        <button type="button" aria-label="First page" disabled={currentPage <= 1} onClick={() => changePage(1)}>«</button>
        <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => changePage(currentPage - 1)}>‹</button>
        {visiblePages.map((page) => (
          <button
            type="button"
            key={page}
            className={page === currentPage ? 'current' : undefined}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Page ${page}`}
            onClick={() => changePage(page)}
          >
            {page}
          </button>
        ))}
        <button type="button" aria-label="Next page" disabled={currentPage >= totalPages} onClick={() => changePage(currentPage + 1)}>›</button>
        <button type="button" aria-label="Last page" disabled={currentPage >= totalPages} onClick={() => changePage(totalPages)}>»</button>
      </nav>
    </footer>
  )
}
