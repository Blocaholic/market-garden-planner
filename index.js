#!/usr/bin/env node
'use strict';
const fs = require('fs');

class MGError extends Error {
  constructor(message = '', value, ...args) {
    super(message, ...args);
    this.message = message;
    this.value = value;
    this.name = 'MarketGardenError';
  }
}

const logError = e => {
  const head = `${e.name} ${e.message} \n`;
  const stack = e.stack.slice(head.length);
  console.error(
    `\x1b[41m\x1b[37m\x1b[1m${e.name}:\x1b[0m \x1b[31m\x1b[1m${e.message}\x1b[0m`
  );
  console.error(stack);
  console.error('### Start Value ' + '#'.repeat(64));
  console.error(e.value);
  console.error('### End Value ' + '#'.repeat(66));
};

function Veggie({
  id,
  Kulturname: culture,
  Sortenname: variety,
  Reihenabstand: rowSpacing,
  Pflanzabstand: plantingDistance,
  Vorziehen: preGrow,
  Umtopfen: rePot,
  minKeimtemp: minGerminationTemp,
  maxKeimtemp: maxGerminationTemp,
  QuickpotGroesse: quickpotSize,
  QuickpotDauer: quickpotDuration,
  Ueberlebensrate: survivalRate,
  Keimrate: germinationRate,
  Beetdauer: bedDuration,
  Beettyp: bedKind,
  Ernterate: harvestRate,
  Ernteeinheit: harvestUnit,
  Erntehaeufigkeit: numberOfHarvests,
  Ernteintervall: harvestInterval,
  Erntezeittoleranz: harvestTolerance,
  Bemerkungen: comment,
  Sortenbeschreibung: description,
}) {
  this.id = Number(id);
  this.culture = String(culture);
  this.variety = String(variety || '');
  this.rowSpacing = Number(rowSpacing);
  this.plantingDistance = Number(plantingDistance);
  this.preGrow = Boolean(preGrow === 'ja');
  this.rePot = Boolean(rePot === 'ja');
  this.minGerminationTemp = Number(minGerminationTemp) || -Infinity;
  this.maxGerminationTemp = Number(maxGerminationTemp) || Infinity;
  this.quickpotSize = Number(quickpotSize);
  this.quickpotDuration = Number(quickpotDuration);
  this.survivalRate = Number(Utils.commaToDot(survivalRate || '1'));
  this.germinationRate = Number(Utils.commaToDot(germinationRate || '1'));
  this.bedDuration = Number(bedDuration);
  this.bedKind = String(bedKind || '');
  this.harvestRate = Number(Utils.commaToDot(harvestRate)) || 0;
  this.harvestUnit = String(harvestUnit || '');
  this.numberOfHarvests = Number(numberOfHarvests || 1);
  this.harvestInterval = Number(harvestInterval) || Infinity;
  this.harvestInterval =
    this.harvestInterval <= 7 && this.harvestInterval > 0
      ? 7
      : Math.round(this.harvestInterval / 7) * 7;
  this.harvestTolerance = Number(harvestTolerance);
  this.comment = String(comment || '');
  this.description = String(description || '');
  if (!this.harvestRate)
    throw new Error('Erwartete Erntemenge darf nicht Null sein!');
  Utils.deepFreeze(this);
}
Object.defineProperties(Veggie.prototype, {
  fullName: {
    get() {
      return `${this.culture} ${this.variety}`;
    },
  },
  isSingleCrop: {
    get() {
      return this.numberOfHarvests === 1;
    },
  },
  isMultiCrop: {
    get() {
      return this.numberOfHarvests > 1;
    },
  },
});

function Crop(date, veggie, amount) {
  if (!veggie instanceof Veggie)
    throw new Error('veggie must be of type Veggie');
  this.date = date;
  this.veggie = veggie;
  this.amount = amount;
  Utils.deepFreeze(this);
}

function Box(ingredients) {
  if (ingredients.constructor !== Array)
    throw new Error('ingredients must be an Array');
  ingredients.map(ingredient => {
    if (ingredient.constructor !== Crop)
      throw new MGError(
        `Each ingredient must be of type "Crop", but is of type "${ingredient.constructor.name}"`,
        {ingredient}
      );
  });
  this.ingredients = ingredients;
  Utils.deepFreeze(this);
}

function Sowing({veggie, sowingDate, seedAmount, crops}) {
  if (!veggie instanceof Veggie)
    throw new Error('veggie must be of type Veggie');
  if (crops.constructor !== Array) throw new Error('crops must be an Array');
  crops.forEach(crop => {
    if (!crop instanceof Crop) throw new Error('crop must be of type Crop');
  });
  if (sowingDate.constructor !== Date)
    throw new Error('sowingDate must be of type Date');
  if (seedAmount.constructor !== Number)
    throw new Error('seedAmount must be of type Number');
  this.veggie = veggie;
  this.sowingDate = new Date(sowingDate.getTime());
  this.seedAmount = seedAmount;
  this.crops = [...crops];
}
Object.defineProperties(Sowing.prototype, {
  quickpotAmount: {
    get() {
      return this.veggie.preGrow
        ? Math.round((this.seedAmount / this.veggie.quickpotSize) * 100) / 100
        : 0;
    },
  },
  bedStartDate: {
    get() {
      return this.veggie.preGrow
        ? Utils.addDaysToDate(this.sowingDate, this.veggie.quickpotDuration)
        : this.sowingDate;
    },
  },
  bedLength: {
    get() {
      return (
        Math.round(
          ((this.veggie.preGrow
            ? this.seedAmount * this.veggie.germinationRate
            : this.seedAmount) /
            ((100 / this.veggie.plantingDistance) *
              Math.floor(75 / this.veggie.rowSpacing))) *
            100
        ) / 100
      );
    },
  },
  finalCropDate: {
    get() {
      return this.crops.reduce(
        (date, crop) => (crop.date > date ? crop.date : date),
        new Date(0)
      );
    },
  },
  availableCropDates: {
    get() {
      let tempDate = new Date(this.sowingDate.getTime());
      tempDate.setDate(
        tempDate.getDate() +
          this.veggie.quickpotDuration +
          this.veggie.bedDuration
      );
      const firstPossibleCropDate = new Date(tempDate.getTime());
      const availableCropDates = [
        firstPossibleCropDate,
        ...Array.from(Array(this.veggie.numberOfHarvests - 1)).reduce(
          (acc, _) => [
            ...acc,
            new Date(
              tempDate.setDate(tempDate.getDate() + this.veggie.harvestInterval)
            ),
          ],
          []
        ),
      ].filter(
        date =>
          !this.crops.map(crop => crop.date.getTime()).includes(date.getTime())
      );
      return availableCropDates;
    },
  },
  minHarvestDate: {
    get() {
      const tempDate = new Date(this.sowingDate.getTime());
      tempDate.setDate(
        this.sowingDate.getDate() +
          this.veggie.bedDuration +
          this.veggie.quickpotDuration
      );
      return tempDate;
    },
  },
  maxHarvestDate: {
    get() {
      const tempDate = new Date(this.minHarvestDate.getTime());
      tempDate.setDate(
        this.minHarvestDate.getDate() + this.veggie.harvestTolerance
      );
      return tempDate;
    },
  },
});

const Utils = new (function () {
  this.deepFreeze = object => {
    const propNames = Object.getOwnPropertyNames(object);
    for (const name of propNames) {
      const value = object[name];
      if (value && typeof value === 'object') Utils.deepFreeze(value);
    }
    return Object.freeze(object);
  };

  this.parseCSV = ({
    csv,
    separator,
    objectsInColumns = false,
    headline = false,
  }) => {
    const matrix = csv
      .trim()
      .split('\n')
      .map(x => x.split(separator));
    const arrayOfArrays = objectsInColumns ? Utils.transpose(matrix) : matrix;
    const [headlines, ...objects] = headline
      ? arrayOfArrays
      : [[arrayOfArrays[0].map((_, i) => i)], arrayOfArrays];
    return objects.map(obj => {
      const result = {};
      obj.map((x, i) => (result[headlines[i]] = x));
      return result;
    });
  };

  this.transpose = matrix => matrix[0].map((_, i) => matrix.map(row => row[i]));

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

  this.idEquals = id => x => x.id === id;
})();

const Data = new (function () {
  const _formatBoxes = (csv, veggies) => {
    const boxes = Utils.parseCSV({
      csv,
      separator: ';',
      headline: true,
    });
    return Utils.deepFreeze(
      boxes.map(box => {
        const ingredients = Object.entries(box)
          .filter(x => Number(x[0]))
          .filter(x => x[1] !== '')
          .map(
            x =>
              new Crop(
                Utils.stringToDate(box.date),
                veggies.find(Utils.idEquals(Number(x[0]))),
                Number(Utils.commaToDot(x[1]))
              )
          );
        return new Box(ingredients);
      })
    );
  };

  const _formatVeggies = csv => {
    const arr = Utils.parseCSV({
      csv,
      separator: ';',
      objectsInColumns: true,
      headline: true,
    });
    return Utils.deepFreeze(arr.map(veggie => new Veggie(veggie)));
  };

  this.getVeggies = () =>
    Utils.readFile('./data/sortensteckbriefe.csv')
      .then(_formatVeggies)
      .catch(console.error);

  this.getBoxes = async veggies => {
    const csv = await Utils.readFile('./data/kistenplanung.csv');
    return _formatBoxes(csv, veggies);
  };
})();

const View = new (function () {
  this.printBoxes = data =>
    console.log(
      data.boxes.map(
        box =>
          `${box.date}: ${Object.entries(box.ingredients).reduce(
            (prev, curr) =>
              prev +
              `${curr[1]} ${
                data.veggies.find(Utils.idEquals(curr[0])).fullName
              }; `,
            ''
          )}`
      )
    );

  this.printSowings = sowings => {
    sowings.map(sowing => {
      console.log(
        `Aussaat von ${sowing.seedAmount} ${
          sowing.veggie.fullName
        } am ${Utils.dateToString(sowing.sowingDate)} mit ${
          sowing.veggie.numberOfHarvests
        } möglichen ${
          sowing.veggie.numberOfHarvests > 1 ? 'Ernten' : 'Ernte'
        } insgesamt.`
      );
      console.log(`Geplante Ernten:`);
      sowing.crops.map(crop =>
        console.log(
          `${Utils.dateToString(crop.date)}\t${crop.amount} ${
            crop.veggie.harvestUnit
          }`
        )
      );
      console.log(`Noch verfügbare Erntetermine:`);
      sowing.availableCropDates.length > 0
        ? sowing.availableCropDates.map(date =>
            console.log(Utils.dateToString(date))
          )
        : console.log('keine');
      console.log('\n');
    });
    console.log(`Insgesamt geplante Aussaaten: ${sowings.length}`);
  };

  this.saveSowingsAsCsv = sowings => {
    const head = `Aussaat Datum;Aussaat Menge;Sorte;Quickpot Menge;Quickpot Größe;Start Datum Beet;Länge Beet(m);letzte Ernte;`;
    const csv = sowings.reduce((csv, sowing) => {
      const veggie = sowing.veggie;
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

const planSowing = (crop, sowings) => {
  const veggie = crop.veggie;
  const seedAmount = Math.ceil(
    crop.amount /
      veggie.harvestRate /
      veggie.survivalRate /
      veggie.germinationRate
  );
  if (crop.veggie.isMultiCrop) {
    const compatibleSowing = sowings
      .filter(sowing => sowing.veggie === veggie)
      .find(sowing =>
        sowing.availableCropDates
          .map(x => x.getTime())
          .includes(crop.date.getTime())
      );
    if (compatibleSowing) {
      const grownCrop =
        compatibleSowing.seedAmount *
        veggie.germinationRate *
        veggie.survivalRate *
        veggie.harvestRate;
      if (grownCrop >= crop.amount) {
        const updatedSowing = new Sowing(compatibleSowing);
        updatedSowing.crops.push(crop);
        return sowings.map(sowing =>
          sowing === compatibleSowing ? updatedSowing : sowing
        );
      } else {
        console.warn(`\
Benötigte Erntemenge (${neededCrop}) ist größer als von bestehendem Satz zu \
ernten (${grownCrop}). Neuer Satz ${veggie.fullName} wird geplant!`);
      }
    }
  }
  if (crop.veggie.isSingleCrop) {
    const compatibleSowing = sowings
      .filter(sowing => sowing.veggie === veggie)
      .find(
        sowing =>
          crop.date >= sowing?.minHarvestDate &&
          crop.date <= sowing?.maxHarvestDate
      );
    if (compatibleSowing) {
      const updatedSowing = new Sowing(compatibleSowing);
      updatedSowing.seedAmount += seedAmount;
      updatedSowing.crops.push(crop);
      return sowings.map(sowing =>
        sowing === compatibleSowing ? updatedSowing : sowing
      );
    }
  }

  const sowingDate = new Date(crop.date.getTime());
  sowingDate.setDate(
    crop.date.getDate() - veggie.bedDuration - veggie.quickpotDuration
  );
  const newSowing = new Sowing({
    veggie,
    sowingDate,
    seedAmount,
    crops: [crop],
  });
  return [...sowings, newSowing];
};

(async () => {
  const veggies = await Data.getVeggies();
  const boxes = await Data.getBoxes(veggies);
  const numberOfBoxes = 174;
  const crops = boxes
    .flatMap(box => box.ingredients)
    .map(
      ({date, veggie, amount}) => new Crop(date, veggie, amount * numberOfBoxes)
    );
  const sowings = crops.reduce(
    (sowings, crop) => planSowing(crop, sowings),
    []
  );
  View.printSowings(sowings);
  View.saveSowingsAsCsv(sowings);
})().catch(e => logError(e));
