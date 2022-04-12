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
    box
      .slice(1)
      .filter(x => x)
      .forEach((quantity, j) => (boxes[i].ingredients[head[j]] = quantity));
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

Promise.all([veggiesPromise, boxesPromise]).then(([veggies, boxes]) => {
  View.printBoxes({veggies, boxes});
});
