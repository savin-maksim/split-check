import {
  memo,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { Modal, Input, Button, EButtonVariant } from '@/shared/ui';

export interface ISingleInputModalProps {
  /** Whether the modal is shown */
  isOpen: boolean;
  /** Called when the modal should be hidden */
  onClose: () => void;
  /** Title shown at the top of the modal */
  title: string;
  /** Label for the input field */
  label: string;
  /** Optional initial value for the input */
  initialValue?: string;
  /** Text for the submit button */
  submitLabel: string;
  /** Called with the trimmed input value when the user confirms */
  onSubmit: (value: string) => void;
}

/**
 * Re‑usable modal that contains a single text input and confirm/cancel buttons.
 * The input is *uncontrolled* – its value lives in a `ref`, so changing the text
 * does **not** trigger a re‑render of the whole modal. Only the modal itself
 * re‑renders when `isOpen` changes.
 */
export const SingleInputModal = memo(({
  isOpen,
  onClose,
  title,
  label,
  initialValue = '',
  submitLabel,
  onSubmit,
}: ISingleInputModalProps) => {
  // Store the current value in a ref – no state, no re‑render on each keystroke.
  const valueRef = useRef(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // When the modal opens, reset the ref and the actual input — defaultValue
  // only applies on first mount, so reopening would otherwise show stale text.
  useEffect(() => {
    if (isOpen) {
      valueRef.current = initialValue;
      const el = inputRef.current;
      if (el) el.value = initialValue;
      el?.focus();
    }
  }, [isOpen, initialValue]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    valueRef.current = e.target.value;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = valueRef.current.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  }, [onSubmit, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal__title">{title}</h3>
      <div className="modal__inputs">
        <Input
          ref={inputRef}
          name="value"
          label={label}
          defaultValue={initialValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          clearable
          autoFocus
        />
      </div>
      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant={EButtonVariant.Active} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </Modal>
  );
});