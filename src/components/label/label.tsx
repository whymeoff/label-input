import React, {
  MouseEvent,
  ReactElement,
  useLayoutEffect,
  useRef,
} from "react";
import { handleValueTrim } from "src/common/utils/handle-value-trim";
import { ReactComponent as CloseIcon } from "../../common/svg/close.svg";

interface Props {
  value: string;
  id: string;
  onChange: (value: string, id: string) => void;
  onFocus: () => void;
  onBlur: (id: string, isEmpty: boolean) => void;
  onDelete: (id: string) => void;
  disableSpacing?: boolean;
}

const Label = ({
  value,
  id,
  onChange,
  onFocus,
  onBlur,
  onDelete,
  disableSpacing,
}: Props): ReactElement => {
  const labelRef = useRef<HTMLDivElement>(null);

  const handleLabelChange = () => {
    const inputValue = handleValueTrim(labelRef.current, disableSpacing);
    onChange(inputValue, id);
  };

  const handleLabelBlur = () => {
    onBlur(id, labelRef.current?.innerHTML.trim().length === 0);
  };

  const handleLabelClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleDeleteIconClick = (e: MouseEvent<Element>) => {
    e.stopPropagation();
    onDelete(id);
  };

  useLayoutEffect(() => {
    if (!labelRef.current) return;

    labelRef.current.innerText = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelRef]);

  return (
    <div className="label-box">
      <div
        ref={labelRef}
        className="label-box__label"
        onInput={handleLabelChange}
        onClick={handleLabelClick}
        onFocus={onFocus}
        onBlur={handleLabelBlur}
        contentEditable
        suppressContentEditableWarning
      />
      <CloseIcon
        className="label-box__close-icon"
        onClick={handleDeleteIconClick}
      />
    </div>
  );
};

export default Label;
