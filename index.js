#!/usr/bin/env node
'use strict';
const fs = require('fs');

const Utils = new (function () {
  this.deepFreeze = object => {
    const propNames = Object.getOwnPropertyNames(object);
    for (const name of propNames) {
      const value = object[name];
      if (value && typeof value === 'object') Utils.deepFreeze(value);
    }
    return Object.freeze(object);
  };

  this.parseCSV = csv =>
    csv
      .trim()
      .split('\n')
      .map(x => x.split(';'));

  this.readFile = path =>
    new Promise((resolve, reject) =>
      fs.readFile(path, 'utf8', (err, content) =>
        err ? reject(err) : resolve(content)
      )
    );

  this.commaToDot = n => {
    n = '' + n;
    return n.replace(',', '.');
  };

  this.dotToComma = n => {
    n = '' + n;
    return n.replace('.', ',');
  };

  this.dateToString = date => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const yyyy = date.getFullYear();
    const dd = String(d).length === 1 ? `0${d}` : d;
    const mm = String(m).length === 1 ? `0${m}` : m;
    return `${dd}.${mm}.${yyyy}`;
  };

  this.stringToDate = x => {
    const [d, m, y] = x.split('.');
    return new Date(+y, m - 1, +d);
  };

  this.addDaysToDate = (origin, days) => {
    if (origin.constructor.name !== 'Date')
      throw 'First Property of "addDaysToDate()" has to be instance of "Date"';
    if (typeof days !== 'number')
      throw 'Second Property of "addDaysToDate()" has to be of type "number"';
    const result = new Date(origin.getTime());
    result.setDate(result.getDate() + days);
    return result;
  };

  /* this.trimChar = (s, c) => {
    if (s.charAt(0) == c) return trimChar(s.substring(1), c);
    if (s.charAt(s.length - 1) == c)
      return trimChar(s.substring(0, s.length - 1), c);
    return s;
  }; */

  this.writeFile = (path, content) =>
    new Promise((resolve, reject) => {
      fs.writeFile(path, content, 'utf8', err =>
        err ? reject(err) : resolve('File written successful.')
      );
    });
})();

const Data = new (function () {
  const _formatBoxes = csv => {
    const arr = Utils.parseCSV(csv);
    const head = arr[0].slice(1);
    const boxes = new Array(arr.length - 1).fill().map(Object);
    arr.slice(1).forEach((box, i) => {
      boxes[i].datum = Utils.stringToDate(box[0]);
      boxes[i].ingredients = {};
      box.slice(1).forEach((quantity, j) => {
        if (quantity)
          boxes[i].ingredients[head[j]] = Utils.commaToDot(quantity);
      });
    });
    return Utils.deepFreeze(boxes);
  };

  const _formatVeggies = csv => {
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

  this.getVeggies = () =>
    Utils.readFile('./data/sortensteckbriefe.csv')
      .then(_formatVeggies)
      .catch(console.error);

  this.getBoxes = () =>
    Utils.readFile('./data/kistenplanung.csv')
      .then(_formatBoxes)
      .catch(console.error);
})();

const View = new (function () {
  this.printBoxes = data =>
    console.log(
      data.boxes.map(
        box =>
          `${box.datum}: ${Object.entries(box.ingredients).reduce(
            (prev, curr) =>
              prev + `${curr[1]} ${data.veggies[curr[0]].fullName}; `,
            ''
          )}`
      )
    );
})();

const plant = (veggies, boxes, numberOfBoxes) => {
  const plantSets = [];
  boxes.forEach(box => {
    Object.entries(box.ingredients).forEach(([kind, amountPerBox]) => {
      let planned = false;
      const veggie = veggies[kind];
      const bedDuration = veggie['Kulturdauer am Beet'];
      const quickpotDuration = veggie.Anzuchtzeit;
      const seedAmount = Math.ceil(
        (amountPerBox * numberOfBoxes) /
          veggie['Erntemenge pro Ernte'] /
          veggie.Feldquote /
          veggie.Anzuchtquote
      );
      plantSets
        .filter(plantSet => plantSet.kind === kind)
        .forEach(plantSet => {
          if (planned) return;
          if (veggie.isSingleCrop) {
            const minDate = new Date(plantSet.sowingDate.getTime());
            minDate.setDate(
              plantSet.sowingDate.getDate() + bedDuration + quickpotDuration
            );
            const maxDate = new Date(minDate.getTime());
            maxDate.setDate(minDate.getDate() + veggie['Erntezeittoleranz']);
            const minTime = minDate.getTime();
            const maxTime = maxDate.getTime();
            const cropTime = box.datum.getTime();
            if (cropTime >= minTime && cropTime <= maxTime) {
              plantSet.seedAmount += seedAmount;
              plantSet.crops.push([box.datum, amountPerBox * numberOfBoxes]);
              planned = true;
            }
            return;
          }
          if (veggie['Erntehäufigkeit pro Pflanze'] > plantSet.crops.length) {
            const getPossibleCropTimes = (plantSet, veggie) => {
              let tempDate = new Date(plantSet.sowingDate.getTime());
              tempDate.setDate(
                tempDate.getDate() +
                  veggie.Anzuchtzeit +
                  veggie['Kulturdauer am Beet']
              );
              let possibleCropTimes = [tempDate.getTime()];
              const plannedCropTimes = plantSet.crops.map(crop =>
                crop[0].getTime()
              );
              for (let i = 1; i < veggie['Erntehäufigkeit pro Pflanze']; i++) {
                tempDate.setDate(tempDate.getDate() + veggie.Ernteintervall);
                if (!plannedCropTimes.includes(tempDate.getTime()))
                  possibleCropTimes.push(tempDate.getTime());
              }
              return possibleCropTimes;
            };
            const cropTime = box.datum.getTime();
            const possibleCropTimes = getPossibleCropTimes(plantSet, veggie);
            if (!possibleCropTimes.includes(cropTime)) {
              const cropDate = new Date(cropTime);
              const possibleCropDates = possibleCropTimes
                .map(x => new Date(x))
                .map(x => Utils.dateToString(x));
              return;
            }
            const grownCrop =
              plantSet.seedAmount *
              veggie.Anzuchtquote *
              veggie.Feldquote *
              veggie['Erntemenge pro Ernte'];
            const neededCrop = amountPerBox * numberOfBoxes;
            if (grownCrop >= neededCrop) {
              plantSet.crops.push([box.datum, amountPerBox * numberOfBoxes]);
              planned = true;
              return;
            } else {
              console.error(
                `Benötigte Erntemenge (${neededCrop}) ist größer als von bestehendem Satz zu ernten (${grownCrop}). Neuer Satz ${veggies[kind].fullName} wird geplant!`
              );
            }
          }
        });

      const sowingDate = new Date(box.datum.getTime());
      sowingDate.setDate(box.datum.getDate() - bedDuration - quickpotDuration);

      if (!planned)
        plantSets.push({
          kind,
          sowingDate,
          seedAmount,
          crops: [[box.datum, amountPerBox * numberOfBoxes]],
        });
    });
  });
  return plantSets;
};

const veggiesPromise = Data.getVeggies();
const boxesPromise = Data.getBoxes();

Promise.all([veggiesPromise, boxesPromise]).then(([veggies, boxes]) => {
  const plants = plant(veggies, boxes, 174);
  plants.forEach(plant => {
    console.log(
      `Aussaat: ${plant.seedAmount} ${
        veggies[plant.kind].fullName
      } am ${Utils.dateToString(plant.sowingDate)} mit folgenden Ernten:`
    );
    plant.crops.forEach(crop =>
      console.log(
        `${Utils.dateToString(crop[0])}: ${Math.round(crop[1] * 100) / 100}`
      )
    );
  });

  console.log(`Aussaaten gesamt: ${plants.length}`);

  const head = `Aussaat Datum;Aussaat Menge;Sorte;Quickpot Menge;Quickpot Größe;Start Datum Beet;Länge Beet(m);letzte Ernte;`;
  const csv = plants.reduce((csv, plant) => {
    const quickpotSize = veggies[plant.kind].Vorziehen
      ? veggies[plant.kind].Quickpot
      : '';
    const quickpotAmount = Utils.dotToComma(
      veggies[plant.kind].Vorziehen
        ? Math.round((plant.seedAmount / quickpotSize) * 100) / 100
        : ''
    );
    const bedStartDate = veggies[plant.kind].Vorziehen
      ? Utils.dateToString(
          Utils.addDaysToDate(plant.sowingDate, veggies[plant.kind].Anzuchtzeit)
        )
      : Utils.dateToString(plant.sowingDate);
    const bedAmount = veggies[plant.kind].Vorziehen
      ? plant.seedAmount * veggies[plant.kind].Anzuchtquote
      : plant.seedAmount;
    const bedLength = Utils.dotToComma(
      Math.round(
        (bedAmount /
          ((100 / veggies[plant.kind].Pflanzabstand) *
            Math.floor(75 / veggies[plant.kind].Reihenabstand))) *
          100
      ) / 100
    );
    const finalCropDate = Utils.dateToString(
      plant.crops.reduce(
        (prev, curr) => (curr[0].getTime() > prev.getTime() ? curr[0] : prev),
        new Date(0)
      )
    );
    const row = `${Utils.dateToString(plant.sowingDate)};${plant.seedAmount};${
      veggies[plant.kind].fullName
    };${quickpotAmount};${quickpotSize};${bedStartDate};${bedLength};${finalCropDate}`;
    return `${csv}\n${row}`;
  }, head);

  Utils.writeFile('./data/output/plantSets.csv', csv);
});
