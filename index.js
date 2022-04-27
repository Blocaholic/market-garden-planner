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
          boxes[i].ingredients[head[j]] = Number(Utils.commaToDot(quantity));
      });
    });
    return Utils.deepFreeze(boxes);
  };

  const _formatVeggies = csv => {
    const arr = Utils.parseCSV(csv);
    const veggies = {};
    const translate = {
      id: 'id',
      Kulturname: 'culture',
      Sortenname: 'variety',
      Reihenabstand: 'rowSpacing',
      Pflanzabstand: 'plantingDistance',
      Vorziehen: 'preGrow',
      Umtopfen: 'rePot',
      minKeimtemp: 'minGerminationTemp',
      maxKeimtemp: 'maxGerminationTemp',
      QuickpotGroesse: 'quickpotSize',
      QuickpotDauer: 'quickpotDuration',
      Ueberlebensrate: 'survivalRate',
      Keimrate: 'germinationRate',
      Beetdauer: 'bedDuration',
      Beettyp: 'bedKind',
      Ernterate: 'harvestRate',
      Ernteeinheit: 'harvestUnit',
      Erntehaeufigkeit: 'numberOfHarvests',
      Ernteintervall: 'harvestInterval',
      Erntezeittoleranz: 'harvestTolerance',
      Bemerkungen: 'comment',
      Sortenbeschreibung: 'description',
    };
    arr[0].slice(1).forEach(id => (veggies[id] = {}));
    arr.slice(1).forEach(row => {
      const rowID = row[0];
      row
        .slice(1)
        .forEach(
          (element, i) => (veggies[arr[0][i + 1]][translate[rowID]] = element)
        );
    });
    Object.entries(veggies).forEach(([, veggie]) => {
      veggie.rowSpacing = Number(veggie.rowSpacing);
      veggie.plantingDistance = Number(veggie.plantingDistance);
      veggie.preGrow = veggie.preGrow === 'ja';
      veggie.rePot = veggie.rePot === 'ja';
      veggie.minGerminationTemp =
        Number(veggie.minGerminationTemp) || -Infinity;
      veggie.maxGerminationTemp = Number(veggie.maxGerminationTemp) || Infinity;
      veggie.quickpotSize = Number(veggie.quickpotSize);
      veggie.quickpotDuration = Number(veggie.quickpotDuration);
      veggie.survivalRate = Number(
        Utils.commaToDot(veggie.survivalRate || '1')
      );
      veggie.germinationRate = Number(
        Utils.commaToDot(veggie.germinationRate || '1')
      );
      veggie.bedDuration = Number(veggie.bedDuration);
      veggie.harvestRate = Number(Utils.commaToDot(veggie.harvestRate));
      veggie.numberOfHarvests = Number(veggie.numberOfHarvests);
      veggie.harvestInterval = Number(veggie.harvestInterval);
      veggie.harvestInterval =
        veggie.harvestInterval <= 7 && veggie.harvestInterval > 0
          ? 7
          : Math.round(veggie.harvestInterval / 7) * 7;
      veggie.harvestTolerance = Number(veggie.harvestTolerance);
      veggie.fullName = `${veggie.culture} ${veggie.variety}`;
      veggie.isSingleCrop = veggie.numberOfHarvests === 1;
      veggie.isMultiCrop = veggie.numberOfHarvests > 1;
      if (veggie.harvestRate === 0)
        throw 'Erwartete Erntemenge darf nicht Null sein!';
    });
    return Utils.deepFreeze(veggies);
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
  this.printSowings = (sowings, veggies) => {
    sowings.forEach(sowing => {
      console.log(
        `Aussaat: ${sowing.seedAmount} ${
          veggies[sowing.kind].fullName
        } am ${Utils.dateToString(sowing.sowingDate)} mit folgenden Ernten:`
      );
      sowing.crops.forEach(crop =>
        console.log(
          `${Utils.dateToString(crop[0])}: ${Math.round(crop[1] * 100) / 100}`
        )
      );
    });
    console.log(`Aussaaten gesamt: ${sowings.length}`);
  };
  this.saveSowingsAsCsv = (sowings, veggies) => {
    const head = `Aussaat Datum;Aussaat Menge;Sorte;Quickpot Menge;Quickpot Größe;Start Datum Beet;Länge Beet(m);letzte Ernte;`;
    const csv = sowings.reduce((csv, sowing) => {
      const veggie = veggies[sowing.kind];
      const quickpotSize = veggie.preGrow ? veggie.quickpotSize : '';
      const quickpotAmount = Utils.dotToComma(sowing.quickpotAmount);
      const bedStartDate = Utils.dateToString(sowing.bedStartDate);
      const bedLength = Utils.dotToComma(sowing.bedLength);
      const finalCropDate = Utils.dateToString(sowing.finalCropDate);
      const row = `${Utils.dateToString(sowing.sowingDate)};${
        sowing.seedAmount
      };${
        veggie.fullName
      };${quickpotAmount};${quickpotSize};${bedStartDate};${bedLength};${finalCropDate}`;
      return `${csv}\n${row}`;
    }, head);
    Utils.writeFile('./data/output/sowings.csv', csv);
  };
})();

const planSowings = (veggies, boxes, numberOfBoxes) => {
  const sowings = [];
  const getPossibleCropTimes = (sowing, veggie) => {
    let tempDate = new Date(sowing.sowingDate.getTime());
    tempDate.setDate(
      tempDate.getDate() + veggie.quickpotDuration + veggie.bedDuration
    );
    let possibleCropTimes = [tempDate.getTime()];
    const plannedCropTimes = sowing.crops.map(crop => crop[0].getTime());
    for (let i = 1; i < veggie.numberOfHarvests; i++) {
      tempDate.setDate(tempDate.getDate() + veggie.harvestInterval);
      if (!plannedCropTimes.includes(tempDate.getTime()))
        possibleCropTimes.push(tempDate.getTime());
    }
    return possibleCropTimes;
  };
  boxes.forEach(box => {
    Object.entries(box.ingredients).forEach(([kind, amountPerBox]) => {
      let planned = false;
      const veggie = veggies[kind];
      const seedAmount = Math.ceil(
        (amountPerBox * numberOfBoxes) /
          veggie.harvestRate /
          veggie.survivalRate /
          veggie.germinationRate
      );
      sowings
        .filter(sowing => sowing.kind === kind)
        .forEach(sowing => {
          if (planned) return;
          if (veggie.isSingleCrop) {
            const minDate = new Date(sowing.sowingDate.getTime());
            minDate.setDate(
              sowing.sowingDate.getDate() +
                veggie.bedDuration +
                veggie.quickpotDuration
            );
            const maxDate = new Date(minDate.getTime());
            maxDate.setDate(minDate.getDate() + veggie.harvestTolerance);
            const minTime = minDate.getTime();
            const maxTime = maxDate.getTime();
            const cropTime = box.datum.getTime();
            if (cropTime >= minTime && cropTime <= maxTime) {
              sowing.seedAmount += seedAmount;
              sowing.crops.push([box.datum, amountPerBox * numberOfBoxes]);
              planned = true;
            }
            return;
          }
          if (veggie.numberOfHarvests > sowing.crops.length) {
            const cropTime = box.datum.getTime();
            const possibleCropTimes = getPossibleCropTimes(sowing, veggie);
            if (!possibleCropTimes.includes(cropTime)) {
              const cropDate = new Date(cropTime);
              const possibleCropDates = possibleCropTimes
                .map(x => new Date(x))
                .map(x => Utils.dateToString(x));
              return;
            }
            const grownCrop =
              sowing.seedAmount *
              veggie.germinationRate *
              veggie.survivalRate *
              veggie.harvestRate;
            const neededCrop = amountPerBox * numberOfBoxes;
            if (grownCrop >= neededCrop) {
              sowing.crops.push([box.datum, amountPerBox * numberOfBoxes]);
              planned = true;
              return;
            } else {
              console.error(`\
Benötigte Erntemenge (${neededCrop}) ist größer als von bestehendem Satz zu \
ernten (${grownCrop}). Neuer Satz ${veggie.fullName} wird geplant!`);
            }
          }
        });

      const sowingDate = new Date(box.datum.getTime());
      sowingDate.setDate(
        box.datum.getDate() - veggie.bedDuration - veggie.quickpotDuration
      );

      if (!planned)
        sowings.push({
          kind,
          sowingDate,
          seedAmount,
          crops: [[box.datum, amountPerBox * numberOfBoxes]],
        });
    });
  });
  sowings.forEach(sowing => {
    const veggie = veggies[sowing.kind];
    sowing.quickpotAmount = veggie.preGrow
      ? Math.round((sowing.seedAmount / veggie.quickpotSize) * 100) / 100
      : '';
    sowing.bedStartDate = veggie.preGrow
      ? Utils.addDaysToDate(sowing.sowingDate, veggie.quickpotDuration)
      : sowing.sowingDate;
    sowing.bedLength =
      Math.round(
        ((veggie.preGrow
          ? sowing.seedAmount * veggie.germinationRate
          : sowing.seedAmount) /
          ((100 / veggie.plantingDistance) *
            Math.floor(75 / veggie.rowSpacing))) *
          100
      ) / 100;
    sowing.finalCropDate = sowing.crops.reduce(
      (prev, curr) => (curr[0].getTime() > prev.getTime() ? curr[0] : prev),
      new Date(0)
    );
  });
  return sowings;
};

const veggiesPromise = Data.getVeggies();
const boxesPromise = Data.getBoxes();

Promise.all([veggiesPromise, boxesPromise]).then(([veggies, boxes]) => {
  const sowings = planSowings(veggies, boxes, 174);
  View.printSowings(sowings, veggies);
  View.saveSowingsAsCsv(sowings, veggies);
});
