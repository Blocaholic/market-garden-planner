import fs from 'fs';

const deepFreeze = object => {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === 'object') deepFreeze(value);
  }
  return Object.freeze(object);
};

const parseCSV = csv =>
  csv
    .trim()
    .split('\n')
    .map(x => x.split(';'));

const readFile = path =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (err, content) =>
      err ? reject(err) : resolve(content)
    )
  );

/* const trimChar = (s, c) => {
  if (s.charAt(0) == c) return trimChar(s.substring(1), c);
  if (s.charAt(s.length - 1) == c)
    return trimChar(s.substring(0, s.length - 1), c);
  return s;
}; */

const writeFile = (path, content) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, content, 'utf8', err =>
      err ? reject(err) : resolve('File written successful.')
    );
  });

export default Object.freeze({
  deepFreeze,
  parseCSV,
  readFile,
  writeFile,
  //trimChar,
});
