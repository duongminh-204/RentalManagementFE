const AdminPagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Trang {page} / {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="dashboard-action-button disabled:opacity-50"
        >
          Trước
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="dashboard-action-button disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
