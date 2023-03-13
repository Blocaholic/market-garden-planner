import {Sowing, Veggie, Crop} from './Datatypes.mjs';
import {fetchJson, addDaysToDate} from './Utils.mjs';

const sowings = await fetchJson(
  'https://marketgardenapi.reinwiese.de/sowings.php'
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

const sowInBed = [];

const plantInBed = sowings
  .filter(sowing => sowing.veggie.preGrow)
  .map(sowing => {
    const quickpots = {};
    quickpots[sowing.veggie.quickpotSize] = sowing.quickpotAmount;
    return {
      date: addDaysToDate(sowing.sowingDate, sowing.veggie.quickpotDuration),
      veggie: sowing.veggie,
      amount: sowing.seedAmount * sowing.veggie.germinationRate,
      quickpots: -quickpots,
      bedLength: 0,
      workStep: 'plantInBed',
    };
  });

const clearBed = [];

console.log([...sowInQuickpot, ...plantInBed]);
