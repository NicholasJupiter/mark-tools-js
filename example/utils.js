/**
 *
 */
export const importAll = (backfn) => backfn.keys().reduce((result, key) => {
  let value = backfn(key);
  value = value.__esModule ? value.default : value;
  const [name] = key.match(/([^/]*)$/);
  const index = name.split('.')[0];
  result[index] = value;
  return result;
}, {});
