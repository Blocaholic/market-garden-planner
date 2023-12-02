import {Sowing, Veggie, Crop} from './Datatypes.mjs';
import {fetchJson, addDaysToDate} from './Utils.mjs';
import * as View from './Report-1View.mjs';

const sowings = await fetchJson(
  'https://anbau24api.reinwiese.de/sowings.php'
).then(data =>
  data.map(
    sowing =>
      new Sowing({
        veggie: new Veggie(sowing.veggie),
        sowingDate: new Date(sowing.sowingDate),
        seedAmount: sowing.seedAmount,
        crops: sowing.crops.map(
          crop => new Crop(new Date(crop.date), crop.amount, crop.salesChannel)
        ),
      })
  )
);

const sowInQuickpot = sowings
  .filter(sowing => sowing.veggie.preGrow)
  .map(sowing => {
    const quickpots = {};
    quickpots[sowing.veggie.quickpotSize] = sowing.quickpotAmount;
    return {
      date: sowing.sowingDate,
      veggie: sowing.veggie,
      amount: sowing.seedAmount,
      quickpots,
      bedLength: 0,
      workStep: 'sowInQuickpot',
    };
  });

const sowInBed = sowings
  .filter(sowing => !sowing.veggie.preGrow)
  .map(sowing => {
    return {
      date: sowing.sowingDate,
      veggie: sowing.veggie,
      amount: sowing.seedAmount,
      quickpots: [],
      bedLength: sowing.bedLength,
      workStep: 'sowInBed',
    };
  });

const plantInBed = sowings
  .filter(sowing => sowing.veggie.preGrow)
  .map(sowing => {
    const quickpots = {};
    quickpots[sowing.veggie.quickpotSize] = -sowing.quickpotAmount;
    return {
      date: addDaysToDate(sowing.sowingDate, sowing.veggie.quickpotDuration),
      veggie: sowing.veggie,
      amount: sowing.seedAmount * sowing.veggie.germinationRate,
      quickpots,
      bedLength: sowing.bedLength,
      workStep: 'plantInBed',
    };
  });

const clearBed = sowings.map(sowing => ({
  date: sowing.lastCropDate,
  veggie: sowing.veggie,
  amount: 0,
  quickpots: [],
  bedLength: -sowing.bedLength,
  workStep: 'clearBed',
}));

const allWorkSteps = [
  ...sowInQuickpot,
  ...plantInBed,
  ...sowInBed,
  ...clearBed,
].sort((a, b) => a.date.getTime() - b.date.getTime());

View.renderWorkSteps(allWorkSteps);
