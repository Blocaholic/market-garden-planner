import {Dayte, Sowing, Veggie, Crop} from './Datatypes.mjs';
import {fetchJson} from './Utils.mjs';
import * as View from './Report-1View.mjs';

const sowings = await fetchJson('./api/sowings.php').then(data =>
  data.map(
    sowing =>
      new Sowing({
        veggie: new Veggie(sowing.veggie),
        sowingDayte: new Dayte(
          `${sowing.sowingDayte.year}-${sowing.sowingDayte.month}-${sowing.sowingDayte.day}`
        ),
        seedAmount: sowing.seedAmount,
        crops: sowing.crops.map(
          crop =>
            new Crop(
              new Dayte(
                `${crop.dayte.year}-${crop.dayte.month}-${crop.dayte.day}`
              ),
              crop.amount,
              crop.salesChannel
            )
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
      dayte: sowing.sowingDayte,
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
      dayte: sowing.sowingDayte,
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
      dayte: sowing.sowingDayte.addDays(sowing.veggie.quickpotDuration),
      veggie: sowing.veggie,
      amount: sowing.seedAmount * sowing.veggie.germinationRate,
      quickpots,
      bedLength: sowing.bedLength,
      workStep: 'plantInBed',
    };
  });

const clearBed = sowings.map(sowing => ({
  dayte: sowing.lastCropDayte,
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
].sort((a, b) => a.dayte.getTime() - b.dayte.getTime());

View.renderWorkSteps(allWorkSteps);
