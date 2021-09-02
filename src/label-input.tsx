import React, {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { nanoid } from "nanoid";
import classNames from "classnames";
import { Label, InputSpacing } from "./components";

import "./common/styles/main.css";
import { handleValueTrim } from "./common/utils/handle-value-trim";
import { followInput } from "./common/utils/follow-input";

enum ELEMENT_TYPE {
  INPUT = "input",
  LABEL = "label",
}

interface InputState {
  type: ELEMENT_TYPE;
  value: string;
  id: string;
}

interface Props {
  value: Array<string>;
  className?: string;
  onChange: (values: Array<string>) => void;
  validate?: (value: string) => boolean;
  errorMessage?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  disableSpacing?: boolean;
}

export const LabelInput = ({
  onChange,
  value,
  validate,
  onBlur,
  onFocus,
  className,
  errorMessage = "Invalid input value",
  disableSpacing = false,
}: Props): ReactElement => {
  const [inputState, setInputState] = useState<Array<InputState>>([]);
  const [shouldValidate, setShouldValidate] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [, setErrorIndexes] = useState<Array<number>>([]);

  const inputRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInputFocused = useRef<boolean>(false);
  const isLabelFocused = useRef<boolean>(false);
  const isWrapperFocused = useRef<boolean>(false);
  const isInputCurrentlyChanged = useRef<boolean>(false);
  const isInitialized = useRef<boolean>(false);
  const inputPosition = useRef<number>(0);

  const handleValidateValue = () => {
    if (!validate) return;

    const errorIndexes: Array<number> = [];

    const errors = inputState.filter((element, index) => {
      const isInvalidValue =
        element.type === ELEMENT_TYPE.INPUT
          ? !validate(inputRef.current?.innerText || "") &&
            Boolean(inputRef.current?.innerText)
          : !validate(element.value);

      if (isInvalidValue) {
        errorIndexes.push(index);
      }

      return isInvalidValue;
    });

    if (errors.length) {
      setError(errorMessage);
    } else {
      setError("");
    }

    setErrorIndexes(errorIndexes);
  };

  const handleMainInput = () => {
    isInputCurrentlyChanged.current = true;

    if (!inputRef.current) return;

    const inputValue = handleValueTrim(inputRef.current, disableSpacing);

    setInputState((state) =>
      state.map((element) => ({
        ...element,
        value:
          element.type === ELEMENT_TYPE.INPUT
            ? inputValue || ""
            : element.value,
      }))
    );

    if (!error) {
      setShouldValidate(false);
    }
  };

  const handleMainInputFocus = () => {
    isInputFocused.current = true;

    if (onFocus) onFocus();
  };

  const handleMainInputBlur = () => {
    isInputFocused.current = false;

    if (onBlur) onBlur();
  };

  const handleMainInputClick = (e: MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleLabelInput = (value: string, id: string) => {
    onChange(
      inputState
        .filter((element) => element.type !== ELEMENT_TYPE.INPUT)
        .map((element) => (element.id === id ? value || "" : element.value))
    );
  };

  const handleLabelFocus = () => {
    isLabelFocused.current = true;
    setShouldValidate(true);

    if (onFocus) onFocus();
  };

  const handleLabelBlur = (id: string, isEmpty: boolean) => {
    isLabelFocused.current = false;

    if (isEmpty) {
      const newInputState: Array<InputState> = [];

      inputState.forEach((element) => {
        if (element.id === id) {
          newInputState.push({
            ...element,
            type: ELEMENT_TYPE.INPUT,
          });
        } else if (element.type !== ELEMENT_TYPE.INPUT) {
          newInputState.push(element);
        }
      });

      setInputState(newInputState);
    }

    if (!error) {
      setShouldValidate(false);
    }

    if (onBlur) onBlur();
  };

  const handleLabelDelete = (id: string) => {
    const foundElementIndex = inputState.findIndex(
      (element) => element.id === id
    );

    if (inputPosition.current > foundElementIndex) {
      inputPosition.current -= 1;
    }

    onChange(
      inputState
        .filter(
          (element) => element.id !== id && element.type !== ELEMENT_TYPE.INPUT
        )
        .map((element) => element.value)
    );
  };

  const handleInputTargetPosition = useCallback(
    (
      targetIndex: number,
      shouldSetFocus: boolean,
      isSpacingElement?: boolean
    ) => {
      const foundInputIndex = inputState.findIndex(
        (element) => element.type === ELEMENT_TYPE.INPUT
      );
      const foundInput = inputState[foundInputIndex];

      if (!foundInput) return;

      if (foundInputIndex < targetIndex && isSpacingElement) {
        targetIndex -= 1;
      }

      const stateWithoutInput = inputState.filter(
        (element) => element.type !== ELEMENT_TYPE.INPUT
      );
      const newInputState: Array<InputState> = [
        ...stateWithoutInput.slice(0, targetIndex),
        foundInput,
        ...stateWithoutInput.slice(targetIndex, stateWithoutInput.length),
      ];

      setInputState(newInputState);
      inputPosition.current = targetIndex;

      if (shouldSetFocus) {
        inputRef.current?.focus();
      }
    },
    [inputState]
  );

  const handleMoveInputToEnd = (setFocus: boolean) => {
    const foundInputIndex = inputState.findIndex(
      (element) => element.type === ELEMENT_TYPE.INPUT
    );

    if (foundInputIndex !== inputState.length - 1) {
      handleInputTargetPosition(inputState.length - 1, setFocus);
    }
  };

  const handleWrapperClick = () => {
    handleMoveInputToEnd(true);

    inputRef.current?.focus();
  };

  const handleWrapperBlur = () => {
    isWrapperFocused.current = false;
  };

  const handleWrapperFocus = () => {
    isWrapperFocused.current = true;
  };

  const handleInputSpacingClick = (targetIndex: number) => {
    handleInputTargetPosition(targetIndex, true, true);
  };

  useEffect(() => {
    handleValidateValue();

    if (isInputFocused.current && inputRef.current) {
      inputRef.current.focus();
    }

    const handleEnterPress = (key: string) => {
      setShouldValidate(true);

      const ignoreListen =
        !inputRef.current?.innerText.trim() ||
        error ||
        (key === " " && !disableSpacing);

      if (ignoreListen) return;

      const newValues: Array<string> = [];

      inputState.forEach((element) => {
        newValues.push(element.value.trim());
      });

      inputPosition.current += 1;

      onChange(newValues);

      if (!error) {
        setShouldValidate(false);
      }
    };

    const handleBackspacePress = () => {
      const newValues: Array<string> = [];

      const ignoreListen =
        inputState.length === 1 ||
        inputRef.current?.innerText.length !== 0 ||
        isInputCurrentlyChanged.current;

      if (ignoreListen) return;

      const foundInputIndex = inputState.findIndex(
        (element) => element.type === ELEMENT_TYPE.INPUT
      );

      if (foundInputIndex === 0) return;

      inputState.forEach((element, index) => {
        if (
          index !== foundInputIndex - 1 &&
          element.type !== ELEMENT_TYPE.INPUT
        ) {
          newValues.push(element.value);
        }
      });

      inputPosition.current -= 1;

      onChange(newValues);
    };

    const arrowLeftKeyPress = () => {
      const ignoreListen =
        inputRef.current?.innerText.length !== 0 || inputState.length === 1;

      if (ignoreListen) return;

      const foundInputIndex = inputState.findIndex(
        (element) => element.type === ELEMENT_TYPE.INPUT
      );

      if (foundInputIndex === 0) return;

      handleInputTargetPosition(foundInputIndex - 1, true);

      followInput(wrapperRef.current, inputRef.current);
    };

    const arrowRightKeyPress = () => {
      const ignoreListen =
        inputRef.current?.innerText.length !== 0 && inputState.length === 1;

      if (ignoreListen) return;

      const foundInputIndex = inputState.findIndex(
        (element) => element.type === ELEMENT_TYPE.INPUT
      );

      if (foundInputIndex === inputState.length - 1) return;

      handleInputTargetPosition(foundInputIndex + 1, true);

      followInput(wrapperRef.current, inputRef.current);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();

      const ignoreKeyPress =
        isLabelFocused.current ||
        !isWrapperFocused.current ||
        !inputRef.current;

      if (ignoreKeyPress) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.stopPropagation()
          e.stopImmediatePropagation()
          handleEnterPress(e.key);
          break;
        case "Backspace":
        case "Delete":
          handleBackspacePress();
          break;
        case "ArrowLeft":
          arrowLeftKeyPress();
          break;
        case "ArrowRight":
          arrowRightKeyPress();
          break;
      }

      isInputCurrentlyChanged.current = false;
    };

    const ref = { ...inputRef };

    if (!ref.current) return;

    ref.current.addEventListener("keyup", handleKeyPress);

    // eslint-disable-next-line consistent-return
    return () => {
      if (ref.current) ref.current.removeEventListener("keyup", handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputState]);

  useEffect(() => {
    if (!value) return;

    if (!isInitialized.current) {
      inputPosition.current = value.length;
    }

    const elements: Array<InputState> = [];
    const stateWithoutInput = inputState.filter(
      (element) => element.type !== ELEMENT_TYPE.INPUT
    );

    value.forEach((element, index) => {
      if (index === inputPosition.current) {
        elements.push({
          id: nanoid(),
          type: ELEMENT_TYPE.INPUT,
          value: "",
        });
      }
      elements.push({
        id:
          stateWithoutInput.length === value.length
            ? stateWithoutInput[index].id
            : nanoid(),
        type: ELEMENT_TYPE.LABEL,
        value: element,
      });
    });

    const isEmpty =
      value.length === 0 || value.length === inputPosition.current;

    if (isEmpty) {
      elements.push({
        id: nanoid(),
        type: ELEMENT_TYPE.INPUT,
        value: "",
      });
    }

    handleValidateValue();
    setInputState(elements);

    isInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={classNames(["wrapper", className])} ref={wrapperRef}>
      <div
        className="wrapper__label-input"
        onClick={handleWrapperClick}
        onBlur={handleWrapperBlur}
        onFocus={handleWrapperFocus}
      >
        {inputState.map((element, index) =>
          element.type === ELEMENT_TYPE.INPUT ? (
            <div
              ref={inputRef}
              className="label-input"
              onInput={handleMainInput}
              onFocus={handleMainInputFocus}
              onBlur={handleMainInputBlur}
              onClick={handleMainInputClick}
              key={element.id}
              contentEditable
              suppressContentEditableWarning
            />
          ) : (
            <div key={element.id} className="label-wrapper">
              {(index === 0 ||
                (inputState[index - 1] &&
                  inputState[index - 1].type !== ELEMENT_TYPE.INPUT)) && (
                <InputSpacing onClick={handleInputSpacingClick} index={index} />
              )}
              <Label
                value={element.value}
                id={element.id}
                onChange={handleLabelInput}
                onFocus={handleLabelFocus}
                onBlur={handleLabelBlur}
                onDelete={handleLabelDelete}
                disableSpacing={disableSpacing}
              />
            </div>
          )
        )}
      </div>
      {error && shouldValidate && <p className="error-label">{error}</p>}
    </div>
  );
};
