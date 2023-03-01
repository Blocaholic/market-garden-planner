import {Box, MarketDay, Veggie, Sowing, Crop} from './Datatypes.mjs';
import * as View from './BoxesView.mjs';
import {idEquals, addDaysToDate, getDatesInRange} from './Utils.mjs';

const fetchJson = async url => await fetch(url).then(x => x.json());

const postAsJson = (url, data) =>
  fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });

const convertToVeggieDatatype = jsonArray =>
  jsonArray.map(item => new Veggie(item));

const updateOnCulture = ({culture, firstCropDate}) => {
  const varieties = new Set(
    veggies
      .filter(v => v.culture === culture)
      .map(v => {
        return {id: v.id, name: v.variety, bedDuration: v.bedDuration};
      })
      .sort()
  );
  View.renderSowingForm({culture, varieties});
  if (varieties.size === 1)
    updateOnVariety({veggieId: [...varieties][0].id, firstCropDate});
};

const updateOnVariety = ({veggieId, firstCropDate}) => {
  const veggie = veggies.find(idEquals(veggieId));
  const sowingDate = addDaysToDate(
    firstCropDate,
    -(veggie.quickpotDuration + veggie.bedDuration)
  );
  const sowing = new Sowing({
    veggie,
    sowingDate,
    seedAmount: 0,
    crops: [],
  });
  View.renderSowingForm({sowing, numberOfBoxes});
};

const multiBoxPreview = ({firstDay, lastDay, interval}) => {
  const dates =
    !firstDay || !lastDay
      ? []
      : getDatesInRange({
          firstDate: new Date(firstDay),
          lastDate: new Date(lastDay),
          interval: Number(interval),
        });
  View.renderBoxPreview(dates);
};

const marketDaysPreview = ({firstDay, lastDay, interval}) => {
  const dates =
    !firstDay || !lastDay
      ? []
      : getDatesInRange({
          firstDate: new Date(firstDay),
          lastDate: new Date(lastDay),
          interval: Number(interval),
        });
  View.renderMarketDaysPreview(dates);
};

const saveBoxes = boxes => {
  View.showEieruhr();
  postAsJson('https://marketgardenapi.reinwiese.de/boxes.php', boxes).then(
    res => {
      if (res.ok) location.reload();
    }
  );
};

const saveMarketDays = marketDays => {
  View.showEieruhr();
  postAsJson(
    'https://marketgardenapi.reinwiese.de/marketDays.php',
    marketDays
  ).then(res => {
    if (res.ok) location.reload();
  });
};

const saveMultiBoxSeries = ({firstDay, lastDay, interval}) => {
  const dates =
    !firstDay || !lastDay
      ? []
      : getDatesInRange({
          firstDate: new Date(firstDay),
          lastDate: new Date(lastDay),
          interval: Number(interval),
        });
  const newBoxes = dates.map(date => new Box(date));
  saveBoxes(newBoxes);
};

const saveMarketDaySeries = ({firstDay, lastDay, interval}) => {
  const dates =
    !firstDay || !lastDay
      ? []
      : getDatesInRange({
          firstDate: new Date(firstDay),
          lastDate: new Date(lastDay),
          interval: Number(interval),
        });
  const marketDays = dates.map(date => new MarketDay(date));
  saveMarketDays(marketDays);
};

const addBox = (boxes, newBoxDate) => {
  const box = new Box(newBoxDate, []);
  saveBoxes(
    [...boxes, box].sort((a, b) => a.date.getTime() - b.date.getTime())
  );
};

const addMarketDay = (marketDays, newMarketDayDate) => {
  const marketDay = new MarketDay(newMarketDayDate, []);
  saveMarketDays(
    [...marketDays, marketDay].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
  );
};

const updateSowingForm = ({
  target,
  veggieId,
  sowingDate,
  seedAmount,
  bedLength,
  quickpotAmount,
  cropAmount,
  totalCropAmount,
  crops,
}) => {
  const veggie = veggies.find(idEquals(veggieId));
  if (target === 'addSowing__bedLength--given')
    seedAmount = veggie.toSeedAmount({bedLength});
  else if (target === 'addSowing__quickpotAmount--given')
    seedAmount = quickpotAmount * veggie.quickpotSize * veggie.seedsPerPot;
  else if (target === 'addSowing__cropAmount--given')
    seedAmount = veggie.toSeedAmount({cropAmount});
  else if (target === 'addSowing__totalCropAmount--given')
    seedAmount = veggie.toSeedAmount({totalCropAmount});
  else if (target === 'quickpots__floor')
    seedAmount =
      (quickpotAmount - 1) * veggie.quickpotSize * veggie.seedsPerPot;
  else if (target === 'quickpots__ceil')
    seedAmount = quickpotAmount * veggie.quickpotSize * veggie.seedsPerPot;
  const newCrops = crops.map(
    (crop, i) => new Crop(crop.date, veggie, crop.boxAmount * numberOfBoxes)
  );
  const sowing = new Sowing({
    veggie,
    sowingDate,
    seedAmount,
    crops: newCrops,
  });
  View.renderSowingForm({sowing, numberOfBoxes});
};

////////////////////////////////////////////////////////////////////////////////

const numberOfBoxes = 50;
const veggies = await fetchJson(
  'https://marketgardenapi.reinwiese.de/veggies.php'
).then(convertToVeggieDatatype);

const cultures = new Set(veggies.map(v => v.culture).sort());

const sowings = await fetchJson(
  'https://marketgardenapi.reinwiese.de/sowings.php'
).then(data => data.map(sowing => new Sowing(sowing)));

const boxes = await fetchJson(
  'https://marketgardenapi.reinwiese.de/boxes.php'
).then(jsonArray =>
  jsonArray.map(item => {
    const ingredients = item.ingredients.map(
      ingredient =>
        new Crop(
          new Date(ingredient.date),
          new Veggie(ingredient.veggie),
          ingredient.amount
        )
    );
    return new Box(new Date(item.date), ingredients);
  })
);

const marketDays = await fetchJson(
  'https://marketgardenapi.reinwiese.de/marketDays.php'
).then(jsonArray =>
  jsonArray.map(item => {
    const ingredients = item.ingredients.map(
      ingredient =>
        new Crop(
          new Date(ingredient.date),
          new Veggie(ingredient.veggie),
          ingredient.amount
        )
    );
    return new MarketDay(new Date(item.date), ingredients);
  })
);

(function init() {
  if (boxes.length > 0) View.hideMultiBoxForm();
  if (boxes.length === 0) View.hideAddBox();
  View.renderBoxes(boxes);
  View.renderBoxPreview([]);
  if (marketDays.length > 0) View.hideAddMarketDaysForm();
  if (marketDays === 0) View.hideAddMarketDayForm();
  View.renderMarketDays(marketDays);
  View.renderMarketDaysPreview([]);
  View.renderSowingForm({cultures});
  View.renderSowings(sowings);
  View.handleMultiBoxPreview(multiBoxPreview);
  View.handleAddMarketDaysPreview(marketDaysPreview);
  View.handleMultiBoxSave(saveMultiBoxSeries);
  View.handleAddMarketDaysSave(saveMarketDaySeries);
  View.handleAddBox(addBox, boxes);
  View.handleAddMarketDay(addMarketDay, marketDays);
  View.handleCulture(updateOnCulture);
  View.handleVariety(updateOnVariety);
  View.handleChangeSowingForm(updateSowingForm);
  View.init();
})();
