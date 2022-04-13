#!/usr/bin/env node
'use strict';
import Utils from './Utils.mjs';
import View from './View.mjs';

const formatBoxes = csv => {
  const arr = Utils.parseCSV(csv);
  const head = arr[0].slice(1);
  const boxes = new Array(arr.length - 1).fill().map(Object);
  arr.slice(1).forEach((box, i) => {
    boxes[i].datum = box[0];
    boxes[i].ingredients = {};
    box.slice(1).forEach((quantity, j) => {
      if (quantity) boxes[i].ingredients[head[j]] = quantity;
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
  boxes.forEach(box => {
    Object.entries(box.ingredients).forEach(([kind, amount]) => {
      const boxDate = Utils.stringToDate(box.datum);
      const veggieAmount = Utils.commaToDot(amount);
      const anzuchtquote = Utils.commaToDot(veggies[kind].Anzuchtquote || '1');
      const feldquote = Utils.commaToDot(veggies[kind].Feldquote || '1');
      const cropAmount = Utils.commaToDot(
        veggies[kind]['Erntemenge pro Ernte']
      );
      const seedAmount = veggieAmount / cropAmount / feldquote / anzuchtquote;
      const beetdauer = veggies[kind]['Kulturdauer am Beet'];
      const anzuchtdauer = veggies[kind].Anzuchtzeit;
      const aussaatDatum = new Date(boxDate.getTime());
      aussaatDatum.setDate(boxDate.getDate() - beetdauer - anzuchtdauer);
      console.log(
        `${Utils.dateToString(boxDate)}: ${Math.round(seedAmount * 10) / 10} ${
          veggies[kind].fullName
        } am ${Utils.dateToString(aussaatDatum)}`
      );
    });
  });
  return boxes;
};

Promise.all([veggiesPromise, boxesPromise]).then(([veggies, boxes]) => {
  const plantSets = plant(veggies, boxes);
  //console.log(plantSets);
  //View.printBoxes({veggies, boxes});
});
