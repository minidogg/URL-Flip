export const randomNum = (max = 100) => Math.floor(Math.random() * max);
export const genRanString = (size) =>
    [...Array(size)]
      .map(() => Math.floor(Math.random() * 36).toString(36))
      .join("");