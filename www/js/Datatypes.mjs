import Utils from './Utils.mjs';
import * as CONFIG from './CONFIG.mjs';

function Veggie({
  id,
  category,
  culture,
  variety,
  rowSpacing,
  plantingDistance,
  preGrow,
  rePot,
  minGerminationTemp,
  maxGerminationTemp,
  quickpotSize,
  quickpotDuration,
  seedsPerPot,
  survivalRate,
  germinationRate,
  bedDuration,
  bedKind,
  harvestRate,
  harvestUnit,
  numberOfHarvests,
  harvestInterval,
  harvestTolerance,
  comment,
  description,
  sellingPricePerUnit,
}) {
  if (!harvestRate)
    throw new Error('Erwartete Erntemenge darf nicht Null sein!');
  if (!sellingPricePerUnit)
    throw new Error('VerkaufspreisProEinheit darf nicht Null sein!');
  this.id = Number(id);
  this.category = String(category);
  this.culture = String(culture);
  this.variety = String(variety || '(Standard)');
  this.rowSpacing = Number(rowSpacing);
  this.plantingDistance = Number(plantingDistance);
  this.preGrow = Boolean(preGrow);
  this.rePot = Boolean(rePot);
  this.minGerminationTemp = Number(minGerminationTemp) || -Infinity;
  this.maxGerminationTemp = Number(maxGerminationTemp) || Infinity;
  this.quickpotSize = Number(quickpotSize);
  this.quickpotDuration = Number(quickpotDuration);
  this.seedsPerPot = Number(Utils.commaToDot(seedsPerPot || '1'));
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
  this.sellingPricePerUnit = Number(Utils.commaToDot(sellingPricePerUnit));
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
  plantsPerRowPerMeter: {
    get() {
      return 100 / this.plantingDistance;
    },
  },
  rowsPerBed: {
    get() {
      return Math.floor(CONFIG.bedWidth / this.rowSpacing);
    },
  },
  plantsPerMeter: {
    get() {
      return this.plantsPerRowPerMeter * this.rowsPerBed;
    },
  },
});
Veggie.prototype.toSeedAmount = function (x) {
  if (x.hasOwnProperty('quickpotAmount'))
    return Math.floor(x.quickpotAmount * this.quickpotSize * this.seedsPerPot);
  if (x.hasOwnProperty('bedLength'))
    return Math.floor(
      (this.preGrow
        ? this.plantsPerMeter / this.germinationRate
        : this.plantsPerMeter) * x.bedLength
    );
  if (x.hasOwnProperty('cropAmount')) {
    if (this.isSingleCrop)
      throw new Error(`Keine "Ernte pro Tag" bei Einfach-Ernten!`);
    return Math.ceil(
      x.cropAmount / this.harvestRate / this.survivalRate / this.germinationRate
    );
  }
  if (x.hasOwnProperty('totalCropAmount')) {
    return (
      x.totalCropAmount /
      (this.isMultiCrop ? this.numberOfHarvests : 1) /
      this.harvestRate /
      this.survivalRate /
      this.germinationRate
    );
  }
  throw new Error(`Could not convert ${JSON.stringify(x)} to seedAmount!`);
};

function Crop(dayte, amount, salesChannel) {
  if (dayte === undefined)
    throw new Error(`Crop.constructor: parameter "dayte" is undefined`);
  if (amount === undefined)
    throw new Error(`Crop.constructor: parameter "amount" is undefined`);
  if (dayte.constructor !== Dayte)
    throw new Error(
      `Crop.constructor: "dayte" must be of type "Dayte" but is of type "${dayte.constructor.name}"!`
    );
  if (amount.constructor !== Number && amount.constructor !== String)
    throw new Error(
      `Crop.constructor: "amount" must be of type "Number" or type "String", but is of type "${amount.constructor.name}"!`
    );
  if (isNaN(Number(amount)))
    throw new Error(
      `Crop.constructor: "amount" must be convertable to a Number, but it's value "${amount}" is not.`
    );
  if (Number(amount) < 0)
    throw new Error(
      `Crop.constructor: "Number(amount)" must not be less than 0, but is "${Number(
        amount
      )}"!`
    );
  if (salesChannel !== 'Box' && salesChannel !== 'MarketDay')
    throw new Error(
      `Crop.constructor: "salesChannel must be either "Box" or "MarketDay", but is ${salesChannel}!`
    );
  this.dayte = dayte;
  this.amount = Number(amount);
  this.salesChannel = salesChannel;
  Utils.deepFreeze(this);
}

function Box(dayte) {
  if (dayte === undefined)
    throw new Error(`Box.constructor: parameter "dayte" is undefined`);
  if (dayte.constructor !== Dayte)
    throw new Error(
      `Box.constructor: "dayte" must be of type "Dayte" but is of type "${date.constructor.name}"!`
    );
  this.dayte = dayte;
  Utils.deepFreeze(this);
}

function MarketDay(dayte) {
  if (dayte === undefined)
    throw new Error(`MarketDay.constructor: parameter "dayte" is undefined`);
  if (dayte.constructor !== Dayte)
    throw new Error(
      `MarketDay.constructor: "dayte" must be of type "Dayte" but is of type "${dayte.constructor.name}"!`
    );
  this.dayte = dayte;
  Utils.deepFreeze(this);
}

function Sowing({veggie, sowingDayte, seedAmount, crops}) {
  this.veggie = veggie;
  this.sowingDayte = sowingDayte;
  this.seedAmount = seedAmount;
  this.crops = [...crops];
  this.id =
    '' +
    Utils.randomHash(
      '' + this.veggie.fullName + this.sowingDate,
      this.seedAmount
    ) +
    Date.now();
  crops.map(crop => {
    if (crop.dayte.weekday !== this.possibleCropDaytes[0].weekday) {
      throw new Error(
        'Der Wochentag der tatsächlichen Ernte stimmt nicht mit dem Wochentag der möglichen Ernte überein.'
      );
    }
  });
  Utils.deepFreeze(this);
}

Object.defineProperties(Sowing.prototype, {
  possibleCropDaytes: {
    get() {
      const veggie = this.veggie;
      const firstDayte = this.sowingDayte.addDays(
        veggie.quickpotDuration + veggie.bedDuration
      );

      const multiCropResult = () =>
        [...Array(veggie.numberOfHarvests - 1)].reduce(
          (acc, _) => [...acc, acc.at(-1).addDays(veggie.harvestInterval)],
          [firstDayte]
        );

      const singleCropResult = () => {
        const lastDayte = firstDayte.addDays(veggie.harvestTolerance);
        return Utils.getDaytesInRange({
          weekday: CONFIG.weekday,
          firstDayte,
          lastDayte,
          interval: 7,
        });
      };

      return veggie.isMultiCrop ? multiCropResult() : singleCropResult();
    },
  },
  totalCropAmount: {
    get() {
      const veggie = this.veggie;
      return (
        Math.round(
          (veggie.isMultiCrop
            ? this.cropAmount * veggie.numberOfHarvests
            : this.seedAmount *
              veggie.germinationRate *
              veggie.survivalRate *
              veggie.harvestRate) * 100
        ) / 100
      );
    },
  },
  cropAmount: {
    get() {
      const veggie = this.veggie;
      return veggie.isMultiCrop
        ? Math.round(
            this.seedAmount *
              veggie.germinationRate *
              veggie.survivalRate *
              veggie.harvestRate *
              100
          ) / 100
        : undefined;
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
              Math.floor(CONFIG.bedWidth / this.veggie.rowSpacing))) *
            100
        ) / 100
      );
    },
  },
  quickpotAmount: {
    get() {
      return this.veggie.preGrow
        ? Math.ceil(
            this.seedAmount / this.veggie.quickpotSize / this.veggie.seedsPerPot
          )
        : 0;
    },
  },
  emptyQuickpotSlots: {
    get() {
      return this.veggie.preGrow
        ? this.quickpotAmount * this.veggie.quickpotSize -
            this.seedAmount / this.veggie.seedsPerPot
        : 0;
    },
  },
  lastCropDayte: {
    get() {
      return this.crops
        .filter(crop => crop.amount > 0)
        .reduce(
          (max, crop) =>
            max.getTime() > crop.dayte.getTime() ? max : crop.dayte,
          new Dayte('0000-01-01')
        );
    },
  },
});

function Dayte(date) {
  // date: DD.MM.YYYY (DE) oder YYYY-MM-DD (ISO)
  const dateExists = dayte => {
    const date = new Date(dayte.iso);
    if (Number(dayte.day) !== date.getDate()) return false;
    if (Number(dayte.month) !== date.getMonth() + 1) return false;
    if (Number(dayte.year) !== date.getFullYear()) return false;
    return true;
  };

  if (typeof date !== 'string')
    throw new Error(
      `date must be of type string but is of type ${typeof date}.`
    );
  if (date.length !== 10)
    throw new Error(
      `date must have 10 characters but has ${date.length}. (${date})`
    );

  let format;
  if (date[2] === '.' && date[5] === '.') {
    format = 'DE';
  } else if (date[4] === '-' && date[7] === '-') {
    format = 'ISO';
  } else {
    throw new Error('invalid date format');
  }

  if (format === 'DE') {
    this.day = date.slice(0, 2);
    this.month = date.slice(3, 5);
    this.year = date.slice(6, 10);
  } else if (format === 'ISO') {
    this.day = date.slice(8, 10);
    this.month = date.slice(5, 7);
    this.year = date.slice(0, 4);
  }

  if (Number(this.day) < 1 || Number(this.day) > 31)
    throw new Error('day must be between 01 and 31');
  if (Number(this.month) < 1 || Number(this.month) > 12)
    throw new Error('month must be between 01 and 12');
  if (Number(this.year) < 0 || Number(this.year) > 9999)
    throw new Error('year must be between 0000 and 9999');
  if (!dateExists(this)) throw new Error('date does not exist');
  Utils.deepFreeze(this);
}
Object.defineProperties(Dayte.prototype, {
  de: {
    get() {
      return `${this.day}.${this.month}.${this.year}`;
    },
  },
  iso: {
    get() {
      return `${this.year}-${this.month}-${this.day}`;
    },
  },
  weekday: {
    get() {
      return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][
        new Date(this.iso).getDay()
      ];
    },
  },
});
Dayte.prototype.addDays = function (days) {
  if (typeof days !== 'number')
    throw new Error('argument "days" has to be of type "number"');
  const timestamp = Date.UTC(this.year, this.month - 1, this.day, 0, 0, 0);

  const newDate = new Date(timestamp + days * 24 * 60 * 60 * 1000);

  return new Dayte(newDate.toISOString().slice(0, 10));
};
Dayte.prototype.getTime = function () {
  return new Date(this.iso).getTime();
};

export {Veggie, Crop, Box, MarketDay, Sowing, Dayte};
