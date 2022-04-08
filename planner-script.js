#!/usr/bin/env node
'use strict';
const fs = require('fs');

const readFile = path =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (err, content) =>
      err ? reject(err) : resolve(content)
    )
  );

const logError = err => console.error(err);

const parseCSV = csv =>
  csv
    .trim()
    .split('\n')
    .map(x => x.split(';'));

const formatBoxes = csv => {
  const arr = parseCSV(csv);
  const head = arr[0].slice(1);
  const boxes = new Array(arr.length - 1).fill().map(Object);
  arr.slice(1).forEach((box, i) => {
    boxes[i].datum = box[0];
    box
      .slice(1)
      .filter(x => x)
      .forEach((quantity, j) => (boxes[i][head[j]] = quantity));
  });
  return Object.freeze(boxes);
};

const formatVeggies = csv => {
  const arr = parseCSV(csv);
  const kulturen = new Array(arr[0].length - 1).fill().map(Object);
  arr.forEach(row =>
    row.slice(1).forEach((element, i) => (kulturen[i][row[0]] = element))
  );
  return Object.freeze(kulturen);
};

const veggiesPromise = readFile('data/sortensteckbriefe.csv')
  .then(formatVeggies)
  .catch(logError);

const boxesPromise = readFile('data/kistenplanung.csv')
  .then(formatBoxes)
  .catch(logError);

Promise.all([veggiesPromise, boxesPromise]).then(([veggies, boxes]) =>
  console.log(veggies, boxes)
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
