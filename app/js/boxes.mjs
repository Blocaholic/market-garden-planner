import {Box, Veggie, Sowing, Crop} from './Datatypes.mjs';
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
        return {id: v.id, name: v.variety};
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

const saveBoxes = boxes => {
  View.showEieruhr();
  postAsJson('https://marketgardenapi.reinwiese.de/boxes.php', boxes).then(
    res => {
      if (res.ok) location.reload();
    }
  );
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

const addBox = (boxes, newBoxDate) => {
  const box = new Box(newBoxDate, []);
  saveBoxes(
    [...boxes, box].sort((a, b) => a.date.getTime() - b.date.getTime())
  );
};

const updateSowingForm = ({
  target,
  veggieId,
  sowingDate,
  cropAmount,
  boxAmount,
  seedAmount,
  bedLength,
  quickpotAmount,
  crops,
  syncedCrops,
}) => {
  const veggie = veggies.find(idEquals(veggieId));
  if (target === 'quickpotAmount')
    seedAmount = quickpotAmount * veggie.quickpotSize;
  else if (target === 'bedLength')
    seedAmount = veggie.toSeedAmount({bedLength});
  else if (target === 'cropAmount')
    seedAmount = veggie.toSeedAmount({cropAmount});
  else if (target === 'boxAmount')
    seedAmount = veggie.toSeedAmount({cropAmount: boxAmount * numberOfBoxes});
  else if (target === 'floorQuickpot')
    seedAmount = (quickpotAmount - 1) * veggie.quickpotSize;
  else if (target === 'ceilQuickpot')
    seedAmount = quickpotAmount * veggie.quickpotSize;
  const tempSowing = new Sowing({veggie, sowingDate, seedAmount, crops: []});
  const newCrops = crops.map(
    (crop, i) =>
      new Crop(
        crop.date,
        veggie,
        syncedCrops[i + 1]
          ? (Math.floor((tempSowing.cropAmount / numberOfBoxes) * 100) / 100) *
            numberOfBoxes
          : crop.boxAmount * numberOfBoxes
      )
  );
  const sowing = new Sowing({
    veggie,
    sowingDate,
    seedAmount,
    crops: newCrops,
  });
  View.renderSowingForm({sowing, numberOfBoxes, syncedCrops});
};

////////////////////////////////////////////////////////////////////////////////

const numberOfBoxes = 174;
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

(function init() {
  if (boxes.length > 0) View.hideMultiBoxForm();
  if (boxes.length === 0) View.hideAddBox();
  View.renderBoxes(boxes);
  View.renderBoxPreview([]);
  View.renderSowingForm({cultures});
  View.renderSowings(sowings);
  View.handleMultiBoxPreview(multiBoxPreview);
  View.handleMultiBoxSave(saveMultiBoxSeries);
  View.handleAddBox(addBox, boxes);
  View.handleCulture(updateOnCulture);
  View.handleVariety(updateOnVariety);
  View.handleChangeSowingForm(updateSowingForm);
  View.init();
})();
