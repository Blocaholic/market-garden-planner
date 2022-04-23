import Utils from './Utils.mjs';

const formatBoxes = csv => {
  const arr = Utils.parseCSV(csv);
  const head = arr[0].slice(1);
  const boxes = new Array(arr.length - 1).fill().map(Object);
  arr.slice(1).forEach((box, i) => {
    boxes[i].datum = Utils.stringToDate(box[0]);
    boxes[i].ingredients = {};
    box.slice(1).forEach((quantity, j) => {
      if (quantity) boxes[i].ingredients[head[j]] = Utils.commaToDot(quantity);
    });
  });
  return Utils.deepFreeze(boxes);
};

const formatVeggies = csv => {
  const arr = Utils.parseCSV(csv);
  const kulturen = {};
  arr[0].slice(1).forEach(id => (kulturen[id] = {}));
  arr
    .slice(1)
    .forEach(row =>
      row
        .slice(1)
        .forEach((element, i) => (kulturen[arr[0][i + 1]][row[0]] = element))
    );
  Object.entries(kulturen).forEach(([, kultur]) => {
    kultur.fullName = `${kultur.Kulturname} ${kultur.Sortenname}`;
    kultur.Anzuchtquote = Utils.commaToDot(kultur.Anzuchtquote || '1');
    kultur.Feldquote = Utils.commaToDot(kultur.Feldquote || '1');
    kultur['Erntemenge pro Ernte'] = Number(
      Utils.commaToDot(kultur['Erntemenge pro Ernte'])
    );
    if (kultur['Erntemenge pro Ernte'] === 0)
      throw 'Erwartete Erntemenge darf nicht Null sein!';
    kultur['Erntehäufigkeit pro Pflanze'] = Number(
      kultur['Erntehäufigkeit pro Pflanze']
    );
    kultur.isSingleCrop = kultur['Erntehäufigkeit pro Pflanze'] === 1;
    kultur.isMultiCrop = kultur['Erntehäufigkeit pro Pflanze'] > 1;
    kultur['Kulturdauer am Beet'] = Number(kultur['Kulturdauer am Beet']);
    kultur.Anzuchtzeit = Number(kultur.Anzuchtzeit);
    kultur.Erntezeittoleranz = Number(kultur.Erntezeittoleranz);
    kultur.Ernteintervall = Number(kultur.Ernteintervall);
    kultur.Ernteintervall =
      kultur.Ernteintervall <= 7 && kultur.Ernteintervall > 0
        ? 7
        : Math.round(kultur.Ernteintervall / 7) * 7;
    kultur.Quickpot = Number(kultur.Quickpot);
    kultur.Vorziehen = kultur.Vorziehen === 'ja';
  });
  return Utils.deepFreeze(kulturen);
};

const getVeggies = () =>
  Utils.readFile('./data/sortensteckbriefe.csv')
    .then(formatVeggies)
    .catch(console.error);

const getBoxes = () =>
  Utils.readFile('./data/kistenplanung.csv')
    .then(formatBoxes)
    .catch(console.error);

export default Object.freeze({
  getVeggies,
  getBoxes,
});
