const deepFreeze = object => {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === 'object') deepFreeze(value);
  }
  return Object.freeze(object);
};

const commaToDot = n => {
  n = '' + n;
  return n.replace(',', '.');
};

const dotToComma = n => {
  n = '' + n;
  return n.replace('.', ',');
};

const idEquals = id => x => x.id === Number(id);

const dateToString = date => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const yyyy = date.getFullYear();
  const dd = String(d).length === 1 ? `0${d}` : d;
  const mm = String(m).length === 1 ? `0${m}` : m;
  return `${dd}.${mm}.${yyyy}`;
};

const dateToWeekday = date =>
  ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()];

const stringToDate = string => {
  const dd = string.substr(0, 2);
  const mm = string.substr(3, 2);
  const yyyy = string.substr(6, 4);
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  return date;
};

const addDaysToDate = (origin, days) => {
  if (origin.constructor.name !== 'Date')
    throw 'First Property of "addDaysToDate()" has to be instance of "Date"';
  if (typeof days !== 'number')
    throw 'Second Property of "addDaysToDate()" has to be of type "number"';
  const result = new Date(origin.getTime());
  result.setDate(result.getDate() + days);
  return result;
};

const daysBetweenDates = (firstDate, lastDate) =>
  Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));

const getDatesInRange = ({weekday, firstDate, lastDate, interval = 1}) => {
  if (firstDate > lastDate) return [];
  const firstDateOfWeekday = getNextDateOfWeekday(firstDate, weekday);
  const numberOfDates =
    Math.floor(daysBetweenDates(firstDateOfWeekday, lastDate) / interval) + 1;
  const dates = Array.from(Array(numberOfDates - 1)).reduce(
    (dates, _) => [...dates, addDaysToDate(dates.at(-1), interval)],
    [firstDateOfWeekday]
  );
  return dates;
};

const getNextDateOfWeekday = (date, weekday) => {
  const diff =
    ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].indexOf(weekday) - date.getDay();
  const daysUntilWeekday = diff < 0 ? 7 + diff : diff;
  const nextDateOfWeekday = new Date(
    date.getTime() + daysUntilWeekday * 24 * 60 * 60 * 1000
  );
  return nextDateOfWeekday;
};

const getMostFrequent = inputArray => {
  const counter = {};
  for (const element of inputArray) {
    if (counter[element]) counter[element]++;
    else counter[element] = 1;
  }
  let maxValue = -Infinity;
  let maxKey = undefined;
  for (const key in counter) {
    if (counter[key] > maxValue) {
      maxValue = counter[key];
      maxKey = key;
    }
  }
  return maxKey;
};

const fetchJson = async url => await fetch(url).then(x => x.json());

const postAsJson = (url, data) =>
  fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });

const randomHash = (str, seed = 0) => {
  let h1 = 0x69feed11 ^ seed;
  let h2 = Math.random().toFixed(13).slice(-10);
  for (let i = 0, char; i < str.length; i++) {
    char = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ char, 2654435769);
    h2 = Math.imul(h2 ^ char, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (
    '' +
    (4294967296 * (2097151 & h2) + (h1 >>> 0)) +
    Math.random().toFixed(13).slice(-4)
  );
};

export {
  deepFreeze,
  commaToDot,
  dotToComma,
  idEquals,
  dateToString,
  dateToWeekday,
  stringToDate,
  addDaysToDate,
  daysBetweenDates,
  getDatesInRange,
  getMostFrequent,
  fetchJson,
  postAsJson,
  randomHash,
};
export * as default from './Utils.mjs';
