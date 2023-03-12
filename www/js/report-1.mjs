import {Sowing, Veggie, Crop} from './Datatypes.mjs';
import {fetchJson} from './Utils.mjs';

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

console.log(sowings);
