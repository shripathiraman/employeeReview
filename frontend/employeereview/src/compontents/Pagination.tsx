
type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  )

  return (
    <nav className="review-pagination" aria-label="Review pages">
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &lsaquo;
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={currentPage === page ? 'current' : ''}
          aria-current={currentPage === page ? 'page' : undefined}
          disabled={currentPage === page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &rsaquo;
      </button>
    </nav>
  )
}

export default Pagination
