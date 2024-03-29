import {Dayte, Box, MarketDay, Veggie, Sowing, Crop} from './Datatypes.mjs';
import * as View from './PlanningView.mjs';
import {
  idEquals,
  getDaytesInRange,
  commaToDot,
  fetchJson,
  postAsJson,
} from './Utils.mjs';
import * as CONFIG from './CONFIG.mjs';

const convertToVeggieDatatype = jsonArray =>
  jsonArray.map(item => new Veggie(item));

const updateOnCulture = ({culture, firstCropDayte}) => {
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
    updateOnVariety({veggieId: [...varieties][0].id, firstCropDayte});
};

const updateOnVariety = ({veggieId, firstCropDayte}) => {
  const veggie = veggies.find(idEquals(veggieId));
  const sowingDayte = firstCropDayte.addDays(
    -(veggie.quickpotDuration + veggie.bedDuration)
  );
  const sowing =
    sowings.find(
      sowing =>
        sowing.sowingDayte.iso === sowingDayte.iso &&
        sowing.veggie.id === veggie.id
    ) ||
    new Sowing({
      veggie,
      sowingDayte,
      seedAmount: 0,
      crops: [],
    });
  View.renderSowingForm({
    sowing,
    numberOfBoxes: CONFIG.numberOfBoxes,
    boxes,
    marketDays,
  });
};

const multiBoxPreview = ({firstDay, lastDay, interval}) => {
  const daytes =
    !firstDay || !lastDay
      ? []
      : getDaytesInRange({
          weekday: CONFIG.weekday,
          firstDayte: new Dayte(firstDay),
          lastDayte: new Dayte(lastDay),
          interval: Number(interval),
        });
  View.renderBoxPreview(daytes);
};

const marketDaysPreview = ({firstDay, lastDay, interval}) => {
  const daytes =
    !firstDay || !lastDay
      ? []
      : getDaytesInRange({
          weekday: CONFIG.weekday,
          firstDayte: new Dayte(firstDay),
          lastDayte: new Dayte(lastDay),
          interval: Number(interval),
        });
  View.renderMarketDaysPreview(daytes);
};

const saveBoxes = boxes => {
  View.showEieruhr();
  postAsJson('./api/boxes.php', boxes).then(res => {
    if (res.ok) location.reload();
  });
};

const saveMarketDays = marketDays => {
  View.showEieruhr();
  postAsJson('./api/marketDays.php', marketDays).then(res => {
    if (res.ok) location.reload();
  });
};

const saveSowings = sowings => {
  View.showEieruhr();
  postAsJson('./api/sowings.php', sowings).then(res => {
    if (res.ok) location.reload();
  });
};

const saveMultiBoxSeries = ({firstDay, lastDay, interval}) => {
  const dates =
    !firstDay || !lastDay
      ? []
      : getDaytesInRange({
          weekday: CONFIG.weekday,
          firstDayte: new Dayte(firstDay),
          lastDayte: new Dayte(lastDay),
          interval: Number(interval),
        });
  const newBoxes = dates.map(date => new Box(date));
  saveBoxes(newBoxes);
};

const saveMarketDaySeries = ({firstDay, lastDay, interval}) => {
  const daytes =
    !firstDay || !lastDay
      ? []
      : getDaytesInRange({
          weekday: CONFIG.weekday,
          firstDayte: new Dayte(firstDay),
          lastDayte: new Dayte(lastDay),
          interval: Number(interval),
        });
  const marketDays = daytes.map(dayte => new MarketDay(dayte));
  saveMarketDays(marketDays);
};

const addBox = (boxes, newBoxDate) => {
  const box = new Box(newBoxDate);
  saveBoxes(
    [...boxes, box].sort((a, b) => a.dayte.getTime() - b.dayte.getTime())
  );
};

const addMarketDay = (marketDays, newMarketDayDate) => {
  const marketDay = new MarketDay(newMarketDayDate);
  saveMarketDays(
    [...marketDays, marketDay].sort(
      (a, b) => a.dayte.getTime() - b.dayte.getTime()
    )
  );
};

const addSowing = sowingData => {
  const veggie = veggies.find(idEquals(sowingData.veggieId));
  const otherSowings = sowings.filter(
    sowing =>
      sowing.veggie.id !== veggie.id ||
      sowing.sowingDayte.getTime() !== sowingData.sowingDayte.getTime()
  );
  const sowing = new Sowing({
    veggie,
    sowingDayte: sowingData.sowingDayte,
    seedAmount: sowingData.seedAmount,
    crops: sowingData.crops.map(
      crop => new Crop(crop.dayte, commaToDot(crop.amount), crop.salesChannel)
    ),
  });
  const newSowings =
    sowing.seedAmount >= 1
      ? [...otherSowings, sowing].sort(
          (a, b) => a.sowingDayte.getTime() - b.sowingDayte.getTime()
        )
      : [...otherSowings];
  saveSowings(newSowings);
};

const updateSowingForm = ({
  target,
  veggieId,
  sowingDayte,
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
    crop => new Crop(crop.dayte, crop.amount, crop.salesChannel)
  );
  const sowing = new Sowing({
    veggie,
    sowingDayte,
    seedAmount,
    crops: newCrops,
  });
  View.renderSowingForm({
    sowing,
    numberOfBoxes: CONFIG.numberOfBoxes,
    boxes,
    marketDays,
  });
};

////////////////////////////////////////////////////////////////////////////////

const veggies = await fetchJson('./api/veggies.php').then(
  convertToVeggieDatatype
);

const cultures = new Set(veggies.map(v => v.culture).sort());

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

const boxes = await fetchJson('./api/boxes.php').then(jsonArray =>
  jsonArray.map(
    item =>
      new Box(
        new Dayte(`${item.dayte.year}-${item.dayte.month}-${item.dayte.day}`)
      )
  )
);

const marketDays = await fetchJson('./api/marketDays.php').then(jsonArray =>
  jsonArray.map(
    item =>
      new MarketDay(
        new Dayte(`${item.dayte.year}-${item.dayte.month}-${item.dayte.day}`)
      )
  )
);

(function init() {
  if (boxes.length > 0) View.hideMultiBoxForm();
  View.renderBoxes(boxes, sowings);
  View.renderBoxPreview([]);
  if (marketDays.length > 0) View.hideAddMarketDaysForm();
  View.renderMarketDays(marketDays, sowings);
  View.renderMarketDaysPreview([]);
  View.renderSowingForm({cultures});
  View.renderSowings(sowings);
  View.handleMultiBoxPreview(multiBoxPreview);
  View.handleAddMarketDaysPreview(marketDaysPreview);
  View.handleMultiBoxSave(saveMultiBoxSeries);
  View.handleAddMarketDaysSave(saveMarketDaySeries);
  View.handleAddBox(addBox, boxes);
  View.handleAddMarketDay(addMarketDay, marketDays);
  View.handleAddSowing(addSowing);
  View.handleCulture(updateOnCulture);
  View.handleVariety(updateOnVariety);
  View.handleChangeSowingForm(updateSowingForm);
  View.init();
})();
