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
  Object.entries(kulturen).forEach(
    ([, kultur]) =>
      (kultur.fullName = `${kultur.Kulturname} ${kultur.Sortenname}`)
  );
  return Utils.deepFreeze(kulturen);
};

const veggiesPromise = Utils.readFile('data/sortensteckbriefe.csv')
  .then(formatVeggies)
  .catch(console.error);

const boxesPromise = Utils.readFile('data/kistenplanung.csv')
  .then(formatBoxes)
  .catch(console.error);

const plant = (veggies, boxes) => {
  const plantSets = [];
  boxes.forEach(box => {
    Object.entries(box.ingredients).forEach(([kind, amount]) => {
      const anzuchtquote = Utils.commaToDot(veggies[kind].Anzuchtquote || '1');
      const feldquote = Utils.commaToDot(veggies[kind].Feldquote || '1');
      const cropAmount = Utils.commaToDot(
        veggies[kind]['Erntemenge pro Ernte']
      );

      const seedAmount = amount / cropAmount / feldquote / anzuchtquote;
      const beetdauer = veggies[kind]['Kulturdauer am Beet'];
      const anzuchtdauer = veggies[kind].Anzuchtzeit;

      const aussaatDatum = new Date(box.datum.getTime());
      aussaatDatum.setDate(box.datum.getDate() - beetdauer - anzuchtdauer);

      plantSets.push(
        `${Utils.dateToString(box.datum)}: ${
          Math.round(seedAmount * 10) / 10
        } ${veggies[kind].fullName} am ${Utils.dateToString(aussaatDatum)}`
      );
    });
  });
  return plantSets;
};

Promise.all([veggiesPromise, boxesPromise]).then(([veggies, boxes]) => {
  const plantSets = plant(veggies, boxes);
  console.log(plantSets);
  Utils.commaToDot;
  //View.printBoxes({veggies, boxes});
});
