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

function Crop(date, veggie, amount, salesChannel) {
  if (date === undefined)
    throw new Error(`Crop.constructor: parameter "date" is undefined`);
  if (veggie === undefined)
    throw new Error(`Crop.constructor: parameter "veggie" is undefined`);
  if (amount === undefined)
    throw new Error(`Crop.constructor: parameter "amount" is undefined`);
  if (date.constructor !== Date)
    throw new Error(
      `Crop.constructor: "date" must be of type "Date" but is of type "${date.constructor.name}"!`
    );
  if (veggie.constructor !== Veggie)
    throw new Error(
      `Crop.constructor: "veggie" must be of type "Veggie" but is of type "${veggie.constructor.name}"`
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
  this.date = new Date(date.getTime());
  this.veggie = veggie;
  this.amount = Number(amount);
  this.salesChannel = salesChannel;
  Utils.deepFreeze(this);
}

function Box(date, ingredients = []) {
  if (date === undefined)
    throw new Error(`Box.constructor: parameter "date" is undefined`);
  if (date.constructor !== Date)
    throw new Error(
      `Box.constructor: "date" must be of type "Date" but is of type "${date.constructor.name}"!`
    );
  if (ingredients.constructor !== Array)
    throw new Error(
      `Box.constructor: "ingredients" must be of type "Array", but is of type "${ingredients.constructor.name}"!`
    );
  ingredients.map(ingredient => {
    if (ingredient.constructor !== Crop)
      throw new Error(
        `Box.constructor: Each "ingredient" must be of type "Crop", but is of type "${ingredient.constructor.name}"!`
      );
    if (ingredient.date.getTime() !== date.getTime())
      throw new Error(
        `Box.constructor: Each crop must be of the same date as the box! Box date.getTime(): ${date.getTime()}; Ingredient date.getTime(): ${ingredient.date.getTime()}`
      );
  });
  this.date = new Date(date.getTime());
  this.date.setHours(0, 0, 0, 0);
  this.ingredients = [...ingredients];
  Utils.deepFreeze(this);
}

function MarketDay(date, ingredients = []) {
  if (date === undefined)
    throw new Error(`MarketDay.constructor: parameter "date" is undefined`);
  if (date.constructor !== Date)
    throw new Error(
      `MarketDay.constructor: "date" must be of type "Date" but is of type "${date.constructor.name}"!`
    );
  if (ingredients.constructor !== Array)
    throw new Error(
      `MarketDay.constructor: "ingredients" must be of type "Array", but is of type "${ingredients.constructor.name}"!`
    );
  ingredients.map(ingredient => {
    if (ingredient.constructor !== Crop)
      throw new Error(
        `MarketDay.constructor: Each "ingredient" must be of type "Crop", but is of type "${ingredient.constructor.name}"!`
      );
    if (ingredient.date.getTime() !== date.getTime())
      throw new Error(
        `MarketDay.constructor: Each crop must be of the same date as the MarketDay! MarketDay date.getTime(): ${date.getTime()}; Ingredient date.getTime(): ${ingredient.date.getTime()}`
      );
  });
  this.date = new Date(date.getTime());
  this.date.setHours(0, 0, 0, 0);
  this.ingredients = [...ingredients];
  Utils.deepFreeze(this);
}

function Sowing({veggie, sowingDate, seedAmount, crops}) {
  this.veggie = veggie;
  this.sowingDate = new Date(sowingDate.getTime());
  this.seedAmount = seedAmount;
  this.crops = [...crops];
  crops.map(crop => {
    if (
      Utils.dateToWeekday(crop.date) !==
      Utils.dateToWeekday(this.possibleCropDates[0])
    ) {
      throw new Error(
        'Der Wochentag der tatsächlichen Ernte stimmt nicht mit dem Wochentag der möglichen Ernte überein.'
      );
    }
  });
  Utils.deepFreeze(this);
}

Object.defineProperties(Sowing.prototype, {
  possibleCropDates: {
    get() {
      const veggie = this.veggie;
      const firstDate = Utils.addDaysToDate(
        this.sowingDate,
        veggie.quickpotDuration + veggie.bedDuration
      );

      const multiCropResult = () =>
        [...Array(veggie.numberOfHarvests - 1)].reduce(
          (acc, _) => [
            ...acc,
            Utils.addDaysToDate(acc.at(-1), veggie.harvestInterval),
          ],
          [firstDate]
        );

      const singleCropResult = () => {
        const lastDate = Utils.addDaysToDate(
          firstDate,
          veggie.harvestTolerance
        );
        return Utils.getDatesInRange({
          weekday: CONFIG.weekday,
          firstDate,
          lastDate,
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
});

export {Veggie, Crop, Box, MarketDay, Sowing};
