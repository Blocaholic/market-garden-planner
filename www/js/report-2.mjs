import {Dayte, Sowing, Veggie, Crop} from './Datatypes.mjs';
import {fetchJson} from './Utils.mjs';
import * as View from './Report-2View.mjs';

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

const seedRequirement = sowings.reduce((requirement, sowing) => {
  if (!requirement[sowing.veggie.id]) {
    requirement[sowing.veggie.id] = {};
  }
  requirement[sowing.veggie.id].culture = sowing.veggie.culture;
  requirement[sowing.veggie.id].variety = sowing.veggie.variety;
  requirement[sowing.veggie.id].seedAmount = requirement[sowing.veggie.id]
    .seedAmount
    ? requirement[sowing.veggie.id].seedAmount + Number(sowing.seedAmount)
    : Number(sowing.seedAmount);

  return requirement;
}, {});

View.render(Object.values(seedRequirement));
