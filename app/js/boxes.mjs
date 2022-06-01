import {Box, Veggie, Sowing, Crop} from './Datatypes.mjs';
import * as View from './BoxesView.mjs';
import {
  idEquals,
  addDaysToDate,
  daysBetweenDates,
  dateToString,
} from './Utils.mjs';

const fetchJson = async url => await fetch(url).then(x => x.json());

const postAsJson = (url, data) =>
  fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });

const convertToVeggieDatatype = jsonArray =>
  jsonArray.map(item => new Veggie(item));

const floorQuickpot = (quickpotAmount, veggieId) => {
  const veggie = veggies.find(idEquals(veggieId));
  const seedAmount = (quickpotAmount - 1) * veggie.quickpotSize;
  updateSowingForm(seedAmount, veggieId);
};

const ceilQuickpot = (quickpotAmount, veggieId) => {
  const veggie = veggies.find(idEquals(veggieId));
  const seedAmount = quickpotAmount * veggie.quickpotSize;
  updateSowingForm(seedAmount, veggieId);
};

const updateSowingForm = (seedAmount, veggieId) => {
  const veggie = veggies.find(idEquals(veggieId));
  const boxAmount =
    (seedAmount *
      veggie.germinationRate *
      veggie.survivalRate *
      veggie.harvestRate) /
    numberOfBoxes;
  const bedLength =
    Math.round(
      ((veggie.preGrow ? seedAmount * veggie.germinationRate : seedAmount) /
        ((100 / veggie.plantingDistance) *
          Math.floor(75 / veggie.rowSpacing))) *
        100
    ) / 100;
  const quickpotAmount = veggie.preGrow
    ? Math.ceil(seedAmount / veggie.quickpotSize)
    : 0;
  View.renderSowingForm({
    veggie,
    boxAmount,
    seedAmount,
    bedLength,
    quickpotAmount,
  });
  if (veggie.preGrow) {
    View.renderQuickpots(veggie.quickpotSize, seedAmount);
    View.handleCeilQuickpot(ceilQuickpot);
    View.handleFloorQuickpot(floorQuickpot);
  }
};

const updateOnBoxAmount = (boxAmount, veggieId) => {
  const veggie = veggies.find(idEquals(veggieId));
  const cropAmount = boxAmount * numberOfBoxes;
  const seedAmount = veggie.toSeedAmount({cropAmount});
  updateSowingForm(seedAmount, veggieId);
};

const updateOnBedLength = (bedLength, veggieId) => {
  const veggie = veggies.find(idEquals(veggieId));
  const seedAmount = veggie.toSeedAmount({bedLength});
  updateSowingForm(seedAmount, veggieId);
};

const updateOnQuickpotAmount = (quickpotAmount, veggieId) => {
  const veggie = veggies.find(idEquals(veggieId));
  const seedAmount = veggie.toSeedAmount({quickpotAmount});
  updateSowingForm(seedAmount, veggieId);
};

const updateOnCulture = culture => {
  const varieties = new Set(
    veggies
      .filter(v => v.culture === culture)
      .map(v => {
        return {id: v.id, name: v.variety};
      })
      .sort()
  );
  View.renderSowingForm({culture, varieties});
  if (varieties.size === 1) updateOnVariety([...varieties][0].id);
};

const updateOnVariety = id => {
  const veggie = veggies.find(idEquals(id));
  View.renderSowingForm({veggie});
};

const resetSowingForm = () => View.renderSowingForm({cultures});

const getDatesInRange = ({firstDate, lastDate, interval = 1}) => {
  if (firstDate > lastDate) return [];
  const numberOfDates =
    Math.floor(daysBetweenDates(firstDate, lastDate) / interval) + 1;
  const dates = Array.from(Array(numberOfDates - 1)).reduce(
    (dates, _) => [...dates, addDaysToDate(dates.at(-1), interval)],
    [firstDate]
  );
  return dates;
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

const addBox = (boxes, box) => {
  saveBoxes(
    [...boxes, box].sort((a, b) => a.date.getTime() - b.date.getTime())
  );
};

////////////////////////////////////////////////////////////////////////////////

const numberOfBoxes = 174;
const veggies = await fetchJson(
  'https://marketgardenapi.reinwiese.de/veggies.php'
).then(convertToVeggieDatatype);

const cultures = new Set(veggies.map(v => v.culture).sort());

/* const sowings = await fetchJson(
  'https://marketgardenapi.reinwiese.de/sowings.php'
).then(data => data.map(sowing => new Sowing(sowing))); */

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

//const datum = new Date();
//const crop = new Crop(datum, veggies[42], 42);
//const box = new Box(datum, [crop, crop, crop]);
//console.log(JSON.stringify([box, box, box]));

(function init() {
  if (boxes.length > 0) View.hideMultiBoxForm();
  View.renderBoxes(boxes);
  View.renderBoxPreview([]);
  View.renderSowingForm({cultures});
  View.handleMultiBoxPreview(multiBoxPreview);
  View.handleMultiBoxSave(saveMultiBoxSeries);
  View.handleAddBox(addBox);
  View.handleCulture(updateOnCulture);
  View.handleVariety(updateOnVariety);
  View.handleBoxAmount(updateOnBoxAmount);
  View.handleSeedAmount(updateSowingForm);
  View.handleBedLength(updateOnBedLength);
  View.handleQuickpotAmount(updateOnQuickpotAmount);
  View.handleResetSowingForm(resetSowingForm);
  View.init();
})();
