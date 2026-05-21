import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pageNumbers.push('...');
    }
  }

  // Remove consecutive dots
  const filteredPageNumbers = pageNumbers.filter(
    (num, index, array) => !(num === '...' && array[index - 1] === '...')
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02]">
      <div className="text-sm text-gray-400">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {filteredPageNumbers.map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
            disabled={typeof pageNum !== 'number'}
            className={`min-w-[40px] px-3 py-2 text-sm rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-500/40 ${
              currentPage === pageNum
                ? 'bg-purple-500/20 text-white border border-purple-400/30 shadow-[0_0_0_1px_rgba(167,139,250,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            } ${typeof pageNum !== 'number' ? 'cursor-default' : ''}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;