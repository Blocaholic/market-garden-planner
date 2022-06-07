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

const stringToDate = string => {
  const dd = string.substr(0, 2);
  const mm = string.substr(3, 2);
  const yyyy = string.substr(6, 4);
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  date.setHours(0, 0, 0, 0);
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

export {
  deepFreeze,
  commaToDot,
  dotToComma,
  idEquals,
  dateToString,
  stringToDate,
  addDaysToDate,
  daysBetweenDates,
};
export * as default from './Utils.mjs';
