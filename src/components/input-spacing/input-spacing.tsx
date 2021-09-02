import React, { MouseEvent, ReactElement } from "react";

interface Props {
  onClick: (index: number) => void;
  index: number;
}

const InputSpacing = ({ onClick, index }: Props): ReactElement => {
  const handleSpacingClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    onClick(index);
  };

  return <div className="input-spacing" onClick={handleSpacingClick} />;
};

export default InputSpacing;
