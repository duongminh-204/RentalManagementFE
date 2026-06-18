import { useCallback, useState } from 'react';
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal';

export function useConfirmDelete() {
  const [state, setState] = useState({
    open: false,
    options: null,
    resolve: null,
  });

  const confirmDelete = useCallback((options) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        options,
        resolve,
      });
    });
  }, []);

  const close = useCallback((result) => {
    setState((current) => {
      current.resolve?.(result);
      return { open: false, options: null, resolve: null };
    });
  }, []);

  const handleCancel = useCallback(() => close(false), [close]);
  const handleConfirm = useCallback(() => close(true), [close]);

  const ConfirmDeleteDialog = useCallback(() => {
    if (!state.open || !state.options) return null;

    const {
      title,
      targetLabel,
      description,
      consequences,
      note,
      confirmLabel,
      cancelLabel,
    } = state.options;

    return (
      <ConfirmDeleteModal
        open={state.open}
        title={title}
        targetLabel={targetLabel}
        description={description}
        consequences={consequences}
        note={note}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }, [handleCancel, handleConfirm, state]);

  return { confirmDelete, ConfirmDeleteDialog };
}
