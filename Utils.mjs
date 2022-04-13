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

const commaToDot = n => n.replace(',', '.');

const dateToString = date => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const yyyy = date.getFullYear();
  const dd = String(d).length === 1 ? `0${d}` : d;
  const mm = String(m).length === 1 ? `0${m}` : m;
  return `${dd}.${mm}.${yyyy}`;
};

const stringToDate = x => {
  const [d, m, y] = x.split('.');
  return new Date(+y, m - 1, +d);
};

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
  commaToDot,
  dateToString,
  stringToDate,
  //trimChar,
});
