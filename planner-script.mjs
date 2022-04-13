#!/usr/bin/env node
'use strict';
import Utils from './Utils.mjs';
import View from './View.mjs';

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
    kultur['Erntemenge pro Ernte'] = Utils.commaToDot(
      kultur['Erntemenge pro Ernte']
    );
  });
  return Utils.deepFreeze(kulturen);
};

const veggiesPromise = Utils.readFile('data/sortensteckbriefe.csv')
  .then(formatVeggies)
  .catch(console.error);

const boxesPromise = Utils.readFile('data/kistenplanung.csv')
  .then(formatBoxes)
  .catch(console.error);

const plant = (veggies, boxes, numberOfBoxes) => {
  const plantSets = [];
  boxes.forEach(box => {
    Object.entries(box.ingredients).forEach(([kind, amountPerBox]) => {
      const seedAmount = Math.ceil(
        (amountPerBox * numberOfBoxes) /
          veggies[kind]['Erntemenge pro Ernte'] /
          veggies[kind].Feldquote /
          veggies[kind].Anzuchtquote
      );

      const bedTime = veggies[kind]['Kulturdauer am Beet'];
      const quickpotTime = veggies[kind].Anzuchtzeit;
      const sowingDate = new Date(box.datum.getTime());
      sowingDate.setDate(box.datum.getDate() - bedTime - quickpotTime);

      plantSets.push(
        `${Utils.dateToString(box.datum)}: ${seedAmount} ${
          veggies[kind].fullName
        } am ${Utils.dateToString(sowingDate)}`
      );
    });
  });
  return plantSets;
};

Promise.all([veggiesPromise, boxesPromise]).then(([veggies, boxes]) => {
  console.log(plant(veggies, boxes, 174));
});
