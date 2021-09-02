export const followInput = (
  wrapper?: HTMLElement | null,
  input?: HTMLElement | null
) => {
  if (!wrapper || !input) return;

  wrapper.scrollTo({
    left: input.offsetLeft - wrapper.offsetLeft,
    behavior: "smooth",
  });
};
