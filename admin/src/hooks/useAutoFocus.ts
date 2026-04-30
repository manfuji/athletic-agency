import { useEffect } from 'react';

export default function useAutoFocus(
  ref: React.RefObject<HTMLInputElement | null>,
  isExpanded: boolean,
  shouldFocus: boolean
) {
  useEffect(() => {
    if (isExpanded && shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [isExpanded, shouldFocus, ref]);
}
