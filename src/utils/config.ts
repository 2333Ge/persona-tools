export const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/persona-tools-h5" : "";

export const getLocalPath = (str: string) => {
  return `${BASE_PATH}${str}`;
};
