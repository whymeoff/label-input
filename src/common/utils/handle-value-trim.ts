export const handleValueTrim = (
  el?: HTMLElement | null,
  disableSpacing?: boolean
) => {
  if (!el) return "";

  let inputValue = el?.innerText.replace(/(\r\n|\n|\r)/gm, "");

  if (disableSpacing) {
    inputValue = inputValue
      .trim()
      .split("")
      .filter((char) => char !== " ")
      .join("");
  }

  const breakLineIndex = el.innerText.indexOf("\n");

  const targetPosition =
    breakLineIndex === -1
      ? (window.getSelection()?.getRangeAt(0).startOffset || 0) - 1
      : breakLineIndex;

  const trimDifference = inputValue.length < el.innerText.length;

  if (trimDifference) el.innerText = inputValue;

  if (trimDifference && inputValue) {
    const range = document.createRange();
    const sel = window.getSelection();

    range.setStart(el.childNodes[0], targetPosition);
    range.collapse(true);

    sel?.removeAllRanges();
    sel?.addRange(range);

    el?.focus();
  }

  return inputValue;
};
