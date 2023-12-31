import {Dayte} from './Datatypes.mjs';

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

const daysBetween = (firstDayte, lastDayte) => {
  if (firstDayte.constructor !== Dayte)
    throw new Error(
      `"firstDayte" must be of type "Dayte" but is of type "${firstDayte.constructor.name}"!`
    );
  if (lastDayte.constructor !== Dayte)
    throw new Error(
      `"lastDayte" must be of type "Dayte" but is of type "${lastDayte.constructor.name}"!`
    );
  const firstDate = new Date(firstDayte.iso);
  const lastDate = new Date(lastDayte.iso);
  return Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));
};

const getDaytesInRange = ({weekday, firstDayte, lastDayte, interval = 1}) => {
  if (new Date(firstDayte.iso) > new Date(lastDayte.iso)) return [];
  const firstDayteOfWeekday = getNextDayteOfWeekday(firstDayte, weekday);
  const numberOfDates =
    Math.floor(daysBetween(firstDayteOfWeekday, lastDayte) / interval) + 1;
  const daytes = Array.from(Array(numberOfDates - 1)).reduce(
    (daytes, _) => [...daytes, daytes.at(-1).addDays(interval)],
    [firstDayteOfWeekday]
  );
  return daytes;
};

const getNextDayteOfWeekday = (dayte, weekday) => {
  const date = new Date(dayte.iso);
  const diff =
    ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].indexOf(weekday) - date.getDay();
  const daysUntilWeekday = diff < 0 ? 7 + diff : diff;
  const nextDateOfWeekday = new Date(
    date.getTime() + daysUntilWeekday * 24 * 60 * 60 * 1000
  );
  return new Dayte(nextDateOfWeekday.toJSON().slice(0, 10));
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
  getDaytesInRange,
  getMostFrequent,
  fetchJson,
  postAsJson,
  randomHash,
};
export * as default from './Utils.mjs';
