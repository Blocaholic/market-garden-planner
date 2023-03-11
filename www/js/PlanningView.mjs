import {
  commaToDot,
  dotToComma,
  dateToString,
  dateToWeekday,
  stringToDate,
  addDaysToDate,
  getMostFrequent,
} from './Utils.mjs';
import * as CONFIG from './CONFIG.mjs';

const HANDLER = {};

const $ = id => document.getElementById(id);
const $$ = query => document.querySelectorAll(query);

const handleMultiBoxPreview = handler => {
  const myFunc = _ =>
    handler({
      firstDay: $('addBoxes__firstDay').value,
      lastDay: $('addBoxes__lastDay').value,
      interval: $('addBoxes__interval').value,
    });
  $('addBoxes__firstDay').addEventListener('change', myFunc);
  $('addBoxes__lastDay').addEventListener('change', myFunc);
  $('addBoxes__interval').addEventListener('change', myFunc);
};

const handleAddMarketDaysPreview = handler => {
  const myFunc = _ =>
    handler({
      firstDay: $('addMarketDays__firstDay').value,
      lastDay: $('addMarketDays__lastDay').value,
      interval: $('addMarketDays__interval').value,
    });
  $('addMarketDays__firstDay').addEventListener('change', myFunc);
  $('addMarketDays__lastDay').addEventListener('change', myFunc);
  $('addMarketDays__interval').addEventListener('change', myFunc);
};

const handleMultiBoxSave = handler => {
  $('addBoxes__save').addEventListener('click', _ =>
    handler({
      firstDay: $('addBoxes__firstDay').value,
      lastDay: $('addBoxes__lastDay').value,
      interval: $('addBoxes__interval').value,
    })
  );
};

const handleAddMarketDaysSave = handler => {
  $('addMarketDays__save').addEventListener('click', _ =>
    handler({
      firstDay: $('addMarketDays__firstDay').value,
      lastDay: $('addMarketDays__lastDay').value,
      interval: $('addMarketDays__interval').value,
    })
  );
};

// GEHÖRT HIER NICHT HIN!!!
const getAllDatesOfWeekdayOfYear = (weekday, year) => {
  let allDaysInYear = [];
  let tempDate = new Date(`${year}-01-01`);
  tempDate.setHours(0, 0, 0, 0);
  while (tempDate.getFullYear() === year) {
    allDaysInYear.push(tempDate);
    tempDate = addDaysToDate(tempDate, 1);
  }
  return allDaysInYear.filter(date => dateToWeekday(date) === weekday);
};

const handleAddBox = (handler, boxes) => {
  $('addBox__year').addEventListener('change', e => {
    const year = Number(e.target.value);
    $('addBox__save').style.display = 'none';
    $('addBox__date').style.display = '';
    $('addBox__dateLabel').style.display = '';
    const boxTimes = boxes.map(box => box.date.getTime());
    const possibleDates = getAllDatesOfWeekdayOfYear(
      CONFIG.weekday,
      year
    ).filter(date => !boxTimes.includes(date.getTime()));
    const dateOptions = possibleDates.map(
      date => `<option value="${date}">${dateToString(date)}</option>`
    );
    $('addBox__date').innerHTML = `<option selected></option>${dateOptions}`;
  });
  $('addBox__date').addEventListener(
    'change',
    _ => ($('addBox__save').style.display = '')
  );
  $('addBox__save').addEventListener('click', _ =>
    handler(boxes, new Date($('addBox__date').value))
  );
};

const handleAddMarketDay = (handler, marketDays) => {
  $('addMarketDay__year').addEventListener('change', e => {
    const year = Number(e.target.value);
    $('addMarketDay__save').style.display = 'none';
    $('addMarketDay__date').style.display = '';
    $('addMarketDay__dateLabel').style.display = '';
    const marketDayTimes = marketDays.map(marketDay =>
      marketDay.date.getTime()
    );
    const possibleDates = getAllDatesOfWeekdayOfYear(
      CONFIG.weekday,
      year
    ).filter(date => !marketDayTimes.includes(date.getTime()));
    const dateOptions = possibleDates.map(
      date => `<option value="${date}">${dateToString(date)}</option>`
    );
    $(
      'addMarketDay__date'
    ).innerHTML = `<option selected></option>${dateOptions}`;
  });
  $('addMarketDay__date').addEventListener(
    'change',
    _ => ($('addMarketDay__save').style.display = '')
  );
  $('addMarketDay__save').addEventListener('click', _ =>
    handler(marketDays, new Date($('addMarketDay__date').value))
  );
};

const handleAddSowing = handler => {
  $('addSowing__save').addEventListener('click', _ => {
    const sowingData = {};
    sowingData.veggieId = $('addSowing__variety').value;
    sowingData.sowingDate = stringToDate($('addSowing__date').innerHTML);
    sowingData.seedAmount = $('addSowing__seedAmount--given').value;
    const boxCrops = [...$$('.addSowing__amountPerBox')].map(element => ({
      date: stringToDate(element.id.slice(-10)),
      amount: element.value,
      salesChannel: 'Box',
    }));
    const marketDayCrops = [...$$('.addSowing__amountForMarket')].map(
      element => ({
        date: stringToDate(element.id.slice(-10)),
        amount: element.value,
        salesChannel: 'MarketDay',
      })
    );
    sowingData.crops = [...boxCrops, ...marketDayCrops];
    handler(sowingData);
  });
};

const handleCulture = handler =>
  $('addSowing__culture')?.addEventListener('change', e => {
    handler({
      culture: e.target.value,
      firstCropDate: stringToDate($('addSowing__firstCropDate').innerHTML),
    });
    //$('addSowing').scrollIntoView({block: 'start', behavior: 'smooth'});
  });

const handleVariety = handler =>
  $('addSowing__variety')?.addEventListener('change', e =>
    handler({
      veggieId: e.target.value,
      firstCropDate: stringToDate($('addSowing__firstCropDate').innerHTML),
    })
  );

const handleChangeSowingForm = handler => {
  const getAllAmountPerBox = () =>
    [...$$('.addSowing__amountPerBox')].map(node => ({
      date: stringToDate(node.id.substr(-10)),
      amount: commaToDot(node.value),
      salesChannel: 'Box',
    }));
  const getAllAmountForMarket = () =>
    [...$$('.addSowing__amountForMarket')].map(node => ({
      date: stringToDate(node.id.substr(-10)),
      amount: commaToDot(node.value),
      salesChannel: 'MarketDay',
    }));
  const getCrops = () => [...getAllAmountPerBox(), ...getAllAmountForMarket()];
  const getSowingFormData = event => ({
    target:
      event.target.id === 'quickpots__floorArrow'
        ? 'quickpots__floor'
        : event.target.id,
    veggieId: $('addSowing__variety').value,
    sowingDate: stringToDate($('addSowing__date').innerHTML),
    seedAmount: commaToDot($('addSowing__seedAmount--given').value),
    bedLength: commaToDot($('addSowing__bedLength--given').value),
    quickpotAmount: commaToDot($('addSowing__quickpotAmount--given').value),
    cropAmount: commaToDot($('addSowing__cropAmount--given').value),
    totalCropAmount: commaToDot($('addSowing__totalCropAmount--given').value),
    crops: getCrops(),
  });
  HANDLER.changeSowingForm = handler
    ? event => handler(getSowingFormData(event))
    : HANDLER.changeSowingForm;
  $('addSowing__seedAmount--given').addEventListener(
    'change',
    HANDLER.changeSowingForm
  );
  $('addSowing__seedAmount--given').setAttribute('autocomplete', 'off');
  $('addSowing__seedAmount--given').addEventListener('click', e =>
    e.target.select()
  );
  $('addSowing__bedLength--given').addEventListener(
    'change',
    HANDLER.changeSowingForm
  );
  $('addSowing__bedLength--given').setAttribute('autocomplete', 'off');
  $('addSowing__bedLength--given').addEventListener('click', e =>
    e.target.select()
  );
  $('addSowing__quickpotAmount--given').addEventListener(
    'change',
    HANDLER.changeSowingForm
  );
  $('addSowing__quickpotAmount--given').setAttribute('autocomplete', 'off');
  $('addSowing__quickpotAmount--given').addEventListener('click', e =>
    e.target.select()
  );

  $('addSowing__cropAmount--given').addEventListener(
    'change',
    HANDLER.changeSowingForm
  );
  $('addSowing__cropAmount--given').setAttribute('autocomplete', 'off');
  $('addSowing__cropAmount--given').addEventListener('click', e =>
    e.target.select()
  );
  $('addSowing__totalCropAmount--given').addEventListener(
    'change',
    HANDLER.changeSowingForm
  );
  $('addSowing__totalCropAmount--given').setAttribute('autocomplete', 'off');
  $('addSowing__totalCropAmount--given').addEventListener('click', e =>
    e.target.select()
  );

  $('quickpots__floor')?.addEventListener('click', HANDLER.changeSowingForm);
  $('quickpots__ceil')?.addEventListener('click', HANDLER.changeSowingForm);
  $$('.addSowing__amountPerBox').forEach(crop => {
    crop.addEventListener('change', HANDLER.changeSowingForm);
    crop.setAttribute('autocomplete', 'off');
    crop.addEventListener('click', e => e.target.select());
  });
  $$('.addSowing__amountForMarket').forEach(crop => {
    crop.addEventListener('change', HANDLER.changeSowingForm);
    crop.setAttribute('autocomplete', 'off');
    crop.addEventListener('click', e => e.target.select());
  });
  //$('addSowing').scrollIntoView({block: 'start', behavior: 'smooth'});
};

const hideMultiBoxForm = () => {
  $('addBoxes__wrapper').style.display = 'none';
};

const hideAddMarketDaysForm = () => {
  $('addMarketDays__wrapper').style.display = 'none';
};

const hideAddBox = () => {
  $('addBox__wrapper').style.display = 'none';
};

const hideAddMarketDayForm = () => {
  $('addMarketDay__wrapper').style.display = 'none';
};

const hideSowingForm = () => {
  $('addSowing').style.display = 'none';
};

const showSowingForm = data => {
  const {firstCropDate, veggieId = undefined} = data;
  clearSowingForm();
  $('addSowing__firstCropDate').innerHTML = firstCropDate;
  $('addSowing__dateWrapper').style.display = 'none';
  $('addSowing__crops').style.display = 'none';
  $('addSowing').style.display = '';
  if (veggieId) {
    $(
      'addSowing__variety'
    ).innerHTML = `<option value="${veggieId}" selected></option>`;
    $('addSowing__variety').dispatchEvent(new Event('change'));
  }
  $('addSowing').scrollIntoView({block: 'start', behavior: 'smooth'});
};

const clearSowingForm = () => {
  $('addSowing__crops').innerHTML = '';
  $('addSowing__crops').style.display = 'none';
  $('quickpots').innerHTML = '';
  $('addSowing__seedAmount--given').value = 0;
  $('addSowing__bedLength--given').value = 0;
  $('addSowing__quickpotAmount--given').value = 0;
  $('addSowing__requirements').style.display = 'none';
  $('addSowing__veggieName').style.display = 'none';
  $('addSowing__variety').style.display = 'none';
  $('addSowing__culture').style.display = '';
  $('addSowing__date').innerHTML = '';
  $('addSowing__dateWrapper').style.display = 'none';
  $('addSowing__firstCropDateWrapper').style.display = 'none';
  $('addSowing__culture').selectedIndex = 0;
  $('addSowing__variety').selectedIndex = 0;
};

const resetSowingForm = event => {
  event.stopPropagation();
  event.preventDefault();
  clearSowingForm();
  $('addSowing').scrollIntoView({block: 'start', behavior: 'smooth'});
};

const openMultiBox = () => {
  $('addBoxes__close').style.display = '';
  $('addBoxes__inputWrapper').style.display = '';
  $('addBoxes__dates').style.display = '';
  $('addBoxes__h3').classList.remove('button');
  $('addBoxes__save').style.display = '';
  $('addBoxes__wrapper').style.borderColor = '';
  $('addBoxes__wrapper').style.margin = '';
  $('addBoxes__wrapper').style.padding = '';
};

const openAddMarketDays = () => {
  $('addMarketDays__close').style.display = '';
  $('addMarketDays__inputWrapper').style.display = '';
  $('addMarketDays__dates').style.display = '';
  $('addMarketDays__h3').classList.remove('button');
  $('addMarketDays__save').style.display = '';
  $('addMarketDays__wrapper').style.borderColor = '';
  $('addMarketDays__wrapper').style.margin = '';
  $('addMarketDays__wrapper').style.padding = '';
};

const closeMultiBox = e => {
  e.stopPropagation();
  $('addBoxes__firstDay').value = '';
  $('addBoxes__lastDay').value = '';
  $('addBoxes__interval').value = 7;
  renderBoxPreview([]);
  $('addBoxes__close').style.display = 'none';
  $('addBoxes__inputWrapper').style.display = 'none';
  $('addBoxes__dates').style.display = 'none';
  $('addBoxes__save').style.display = 'none';
  $('addBoxes__h3').classList.add('button');
  $('addBoxes__wrapper').style.borderColor = 'transparent';
  $('addBoxes__wrapper').style.padding = '0';
};

const closeAddMarketDays = e => {
  e.stopPropagation();
  $('addMarketDays__firstDay').value = '';
  $('addMarketDays__lastDay').value = '';
  $('addMarketDays__interval').value = 7;
  renderMarketDaysPreview([]);
  $('addMarketDays__close').style.display = 'none';
  $('addMarketDays__inputWrapper').style.display = 'none';
  $('addMarketDays__dates').style.display = 'none';
  $('addMarketDays__save').style.display = 'none';
  $('addMarketDays__h3').classList.add('button');
  $('addMarketDays__wrapper').style.borderColor = 'transparent';
  $('addMarketDays__wrapper').style.padding = '0';
};

const openAddBox = () => {
  const currentYear = new Date().getFullYear();
  const preferredYear =
    getMostFrequent(
      [...$$('.box__date')].map(boxDateDiv => boxDateDiv.innerHTML.slice(-4))
    ) || currentYear;
  const next30years = [...Array(30)].map((_, key) => key + currentYear);
  const yearOptions = next30years
    .map(year => `<option value="${year}">${year}</option>`)
    .join('');
  $('addBox__year').innerHTML = `<option selected></option>${yearOptions}`;
  $('addBox__year').value = preferredYear;
  $('addBox__close').style.display = '';
  $('addBox__inputWrapper').style.display = '';
  $('addBox__h3').classList.remove('button');
  $('addBox__wrapper').style.borderColor = '';
  $('addBox__wrapper').style.padding = '';
  $('addBox__year').dispatchEvent(new Event('change'));
};

const openAddMarketDay = () => {
  const currentYear = new Date().getFullYear();
  const preferredYear =
    getMostFrequent(
      [...$$('.marketDay__date')].map(boxDateDiv =>
        boxDateDiv.innerHTML.slice(-4)
      )
    ) || currentYear;
  const next30years = [...Array(30)].map((_, key) => key + currentYear);
  const yearOptions = next30years
    .map(year => `<option value="${year}">${year}</option>`)
    .join('');
  $(
    'addMarketDay__year'
  ).innerHTML = `<option selected></option>${yearOptions}`;
  $('addMarketDay__year').value = preferredYear;
  $('addMarketDay__close').style.display = '';
  $('addMarketDay__inputWrapper').style.display = '';
  $('addMarketDay__h3').classList.remove('button');
  $('addMarketDay__wrapper').style.borderColor = '';
  $('addMarketDay__wrapper').style.padding = '';
  $('addMarketDay__year').dispatchEvent(new Event('change'));
};

const closeAddBox = e => {
  e.stopPropagation();
  $('addBox__year').value = '';
  $('addBox__date').value = '';
  $('addBox__close').style.display = 'none';
  $('addBox__inputWrapper').style.display = 'none';
  $('addBox__date').style.display = 'none';
  $('addBox__date').innerHTML = '';
  $('addBox__dateLabel').style.display = 'none';
  $('addBox__save').style.display = 'none';
  $('addBox__h3').classList.add('button');
  $('addBox__wrapper').style.borderColor = 'transparent';
  $('addBox__wrapper').style.padding = '0';
};

const closeAddMarketDay = e => {
  e.stopPropagation();
  $('addMarketDay__year').value = '';
  $('addMarketDay__date').value = '';
  $('addMarketDay__close').style.display = 'none';
  $('addMarketDay__inputWrapper').style.display = 'none';
  $('addMarketDay__date').style.display = 'none';
  $('addMarketDay__date').innerHTML = '';
  $('addMarketDay__dateLabel').style.display = 'none';
  $('addMarketDay__save').style.display = 'none';
  $('addMarketDay__h3').classList.add('button');
  $('addMarketDay__wrapper').style.borderColor = 'transparent';
  $('addMarketDay__wrapper').style.padding = '0';
};

const renderBoxPreview = dates => {
  const numberOfBoxes = dates.length;
  $('addBoxes__save').style.color =
    numberOfBoxes === 0 ? 'rgb(170,170,170)' : 'rgb(0,0,0)';
  const buttonText =
    numberOfBoxes === 1
      ? `1 Kiste hinzufügen`
      : `${numberOfBoxes} Kisten hinzufügen`;
  $('addBoxes__save').innerHTML = buttonText;
  const datesHtml = dates
    .reduce(
      (datesString, date, i, self) =>
        date.getMonth() !== self[i - 1]?.getMonth()
          ? [...datesString, `<br>[${dateToString(date)}]`]
          : [...datesString, `[${dateToString(date)}]`],
      []
    )
    .join(' ');
  $('addBoxes__dates').innerHTML = datesHtml;
};

const renderMarketDaysPreview = dates => {
  const numberOfMarketDays = dates.length;
  $('addMarketDays__save').style.color =
    numberOfMarketDays === 0 ? 'rgb(170,170,170)' : 'rgb(0,0,0)';
  const buttonText =
    numberOfMarketDays === 1
      ? `1 Markttag hinzufügen`
      : `${numberOfMarketDays} Markttage hinzufügen`;
  $('addMarketDays__save').innerHTML = buttonText;
  const datesHtml = dates
    .reduce(
      (datesString, date, i, self) =>
        date.getMonth() !== self[i - 1]?.getMonth()
          ? [...datesString, `<br>[${dateToString(date)}]`]
          : [...datesString, `[${dateToString(date)}]`],
      []
    )
    .join(' ');
  $('addMarketDays__dates').innerHTML = datesHtml;
};

const renderQuickpots = (veggie, seedAmount) => {
  const size = veggie.quickpotSize;
  const filledSlots = Math.ceil(seedAmount / veggie.seedsPerPot);
  if (filledSlots <= 0) return;
  const emptySlots = filledSlots % size ? size - (filledSlots % size) : 0;
  const filledSlotHtml =
    '<div class="quickpots__slot quickpots__slot--filled"></div>';
  const emptySlotHtml =
    '<div class="quickpots__slot quickpots__slot--empty"></div>';
  const buttonsHtml = `<div class="quickpots__actionsWrapper">
      <div class="button" id="quickpots__floor">-<div class="mirror" id="quickpots__floorArrow">&#x2935;</div></div>
      <div class="button" id="quickpots__ceil">+&#x2935;</div>
    </div>`;
  const filledQuickpotHtml = `<div class="quickpots__quickpot quickpots__quickpot${size}">${filledSlotHtml.repeat(
    size
  )}</div>`;
  const partialQuickpot = emptySlots
    ? `<div class="quickpots__quickpot quickpots__quickpot${size}">${filledSlotHtml.repeat(
        size - emptySlots
      )}${emptySlotHtml.repeat(emptySlots)}</div>${buttonsHtml}`
    : '';
  $('quickpots').innerHTML =
    filledQuickpotHtml.repeat(Math.floor(filledSlots / size)) + partialQuickpot;
};

const renderSowingForm = data => {
  // helper functions
  const styleNumber = element => {
    const value =
      element.value !== undefined ? element.value : element.innerHTML;
    element.style.color = value < 0 ? 'rgb(255,0,0)' : '';
    element.value = dotToComma(element.value);
    element.innerHTML = dotToComma(element.innerHTML);
  };

  const varietyIsSelected = () => data.sowing && data.numberOfBoxes;
  const cultureIsSelected = () => data.culture && data.varieties;
  const nothingIsSelected = () => data.cultures;

  const showVeggieName = veggieName => {
    $('addSowing__veggieName').innerHTML = veggieName;
    $('addSowing__veggieName').style.display = '';
  };

  const showSowingDate = date => {
    $('addSowing__date').innerHTML = dateToString(date);
    $('addSowing__dateWrapper').style.display = '';
  };

  const hideCultureSelect = () => {
    $('addSowing__culture').style.display = 'none';
  };

  const hideVarietySelect = () => {
    $('addSowing__variety').style.display = 'none';
  };

  const setVarietySelectValue = selected => {
    $('addSowing__variety').value = selected;
  };

  const showQuickpotRequirements = (veggie, sowing) => {
    $('addSowing__quickpotAmount--given').value = sowing.quickpotAmount;
    $('addSowing__quickpotSize').innerHTML = `Größe ${veggie.quickpotSize}`;
    $('addSowing__quickpot').style.display = '';
    renderQuickpots(veggie, sowing.seedAmount);
  };

  const hideQuickpotRequirements = () => {
    $('addSowing__quickpotAmount--given').value = 0;
    $('addSowing__quickpotSize').innerHTML = ``;
    $('addSowing__quickpot').style.display = 'none';
  };

  const boxExists = (date, boxes) =>
    boxes.some(box => box.date.getTime() === date.getTime());

  const marketDayExists = (date, marketDays) =>
    marketDays.some(marketDay => marketDay.date.getTime() === date.getTime());

  // event listeners
  $('addSowing__close').addEventListener('click', _ => {
    clearSowingForm();
    hideSowingForm();
  });

  // culture and variety are selected
  if (varietyIsSelected()) {
    // variables
    const {sowing, numberOfBoxes, boxes, marketDays} = data;
    const veggie = sowing.veggie;
    // execute
    hideCultureSelect();
    hideVarietySelect();
    setVarietySelectValue(veggie.id);
    showVeggieName(veggie.fullName);
    showSowingDate(sowing.sowingDate);
    // sowingRequirements
    $('addSowing__seedAmount--given').value = sowing.seedAmount;
    $('addSowing__bedLength--given').value = sowing.bedLength;
    $('addSowing__cropAmount--given').value = sowing.cropAmount;
    $('addSowing__totalCropAmount--given').value = sowing.totalCropAmount;
    [...$$('.addSowing__harvestUnit')].map(
      element => (element.innerHTML = veggie.harvestUnit)
    );
    styleNumber($('addSowing__seedAmount--given'));
    styleNumber($('addSowing__bedLength--given'));
    styleNumber($('addSowing__quickpotAmount--given'));
    styleNumber($('addSowing__cropAmount--given'));
    styleNumber($('addSowing__totalCropAmount--given'));
    $('addSowing__requirements').style.display = '';
    veggie.preGrow
      ? showQuickpotRequirements(veggie, sowing)
      : hideQuickpotRequirements();
    veggie.isMultiCrop
      ? ($('addSowing__cropAmount').style.display = '')
      : ($('addSowing__cropAmount').style.display = 'none');
    // crops
    const head1 = `<tr>
    <td></td>
    <td>Kiste</td>
    <td>verfügbar</td>
    <td>Markt</td>
    <td>verfügbar</td>
    <td>Summe</td>
  </tr>`;

    let totalAmountPerClient = 0;
    let totalAvailablePerClient = 0;
    let totalAmountForMarket = 0;
    let totalAvailableForMarket = 0;
    let totalRequiredCropAmount = 0;
    let maxRequiredCropAmount = 0;

    const rows = sowing.possibleCropDates
      .map(date => {
        const amountPerBox =
          sowing.crops.find(
            crop =>
              crop.date.getTime() === date.getTime() &&
              crop.salesChannel === 'Box'
          )?.amount || 0;
        totalAmountPerClient += amountPerBox;
        const amountForMarket =
          sowing.crops.find(
            crop =>
              crop.date.getTime() === date.getTime() &&
              crop.salesChannel === 'MarketDay'
          )?.amount || 0;
        totalAmountForMarket += amountForMarket;
        const availablePerDay =
          sowing.cropAmount - (amountForMarket + amountPerBox * numberOfBoxes);
        totalAvailableForMarket += availablePerDay;
        const availablePerBox = availablePerDay / numberOfBoxes;
        totalAvailablePerClient += availablePerBox;
        const requiredCropAmount =
          amountForMarket + amountPerBox * numberOfBoxes;
        totalRequiredCropAmount += requiredCropAmount;
        if (requiredCropAmount > maxRequiredCropAmount)
          maxRequiredCropAmount = requiredCropAmount;
        const roundedAmountPerBox = Math.round(amountPerBox * 100) / 100;
        const roundedAmountForMarket = Math.round(amountForMarket * 100) / 100;
        const roundedAvailablePerDay = Math.round(availablePerDay * 100) / 100;
        const roundedAvailablePerBox = Math.round(availablePerBox * 100) / 100;
        const roundedRequiredCropAmount =
          Math.round(requiredCropAmount * 100) / 100;
        const row = `<tr>
          <td>${dateToWeekday(date)}, ${dateToString(date)}</td>
          <td><input type="text" class="addSowing__amountPerBox" id="addSowing__amountPerBox--${dateToString(
            date
          )}" value="${dotToComma(roundedAmountPerBox)}" ${
          boxExists(date, boxes) ? '' : 'readonly'
        }></td>
          <td class="addSowing__availablePerBox" id="addSowing__availablePerBox--${dateToString(
            date
          )}">${Math.floor(roundedAvailablePerBox * 100) / 100} ${
          veggie.harvestUnit
        }</td>
          <td><input type="text" class="addSowing__amountForMarket"
                   id="addSowing__amountForMarket--${dateToString(date)}"
                   value="${roundedAmountForMarket}" ${
          marketDayExists(date, marketDays) ? '' : 'readonly'
        }></td>
          <td class="addSowing__availablePerDay" id="addSowing__availablePerDay--${dateToString(
            date
          )}">${roundedAvailablePerDay} ${veggie.harvestUnit}</td>
          <td class="addSowing__requiredCropAmount" id="addSowing__requiredCropAmount--${dateToString(
            date
          )}">${roundedRequiredCropAmount}</td>
        </tr>`;
        return row;
      })
      .join('');

    const totalAvailable = sowing.totalCropAmount - totalRequiredCropAmount;
    const availablePerBox = totalAvailable / numberOfBoxes;
    const head2 = veggie.isSingleCrop
      ? `<tr id="addSowing__singleCropAvailableRow">
    <td>verfügbar</td>
    <td id="addSowing__availablePerBox">${availablePerBox}</td>
    <td></td>
    <td id="addSowing__totalAvailable">${totalAvailable}</td>
    <td></td>
    <td></td>
  </tr>`
      : '';

    const finalRow = `<tr>
    <td>Summe</td>
    <td id="addSowing__totalAmountPerClient">${
      Math.round(totalAmountPerClient * 100) / 100
    }</td>
    <td id="addSowing__totalAvailablePerClient">${
      Math.round(totalAvailablePerClient * 100) / 100
    } ${veggie.harvestUnit}</td>
    <td id="addSowing__totalAmountForMarket">${
      Math.round(totalAmountForMarket * 100) / 100
    }</td>
    <td id="addSowing__totalAvailableForMarket">${
      Math.round(totalAvailableForMarket * 100) / 100
    } ${veggie.harvestUnit}</td>
    <td id="addSowing__totalRequiredCropAmount">${
      Math.round(totalRequiredCropAmount * 100) / 100
    }</td>
  </tr>`;
    const requiredSeedAmount = Math.ceil(
      veggie.toSeedAmount({
        totalCropAmount: veggie.isMultiCrop
          ? maxRequiredCropAmount * veggie.numberOfHarvests
          : totalRequiredCropAmount,
      })
    );
    $('addSowing__seedAmount--required').innerHTML =
      Math.round(requiredSeedAmount * 100) / 100;
    $('addSowing__bedLength--required').innerHTML =
      Math.round(
        ((veggie.preGrow
          ? requiredSeedAmount * veggie.germinationRate
          : requiredSeedAmount) /
          ((100 / veggie.plantingDistance) *
            Math.floor(CONFIG.bedWidth / veggie.rowSpacing))) *
          100
      ) / 100;
    $('addSowing__quickpotAmount--required').innerHTML =
      Math.round(
        (veggie.preGrow
          ? Math.ceil(
              requiredSeedAmount / veggie.quickpotSize / veggie.seedsPerPot
            )
          : 0) * 100
      ) / 100;
    $('addSowing__cropAmount--required').innerHTML = veggie.isMultiCrop
      ? Math.round(maxRequiredCropAmount * 100) / 100
      : '';
    $('addSowing__totalCropAmount--required').innerHTML =
      Math.round(
        (veggie.isMultiCrop
          ? maxRequiredCropAmount * veggie.numberOfHarvests
          : totalRequiredCropAmount) * 100
      ) / 100;

    styleNumber($('addSowing__seedAmount--required'));
    styleNumber($('addSowing__bedLength--required'));
    styleNumber($('addSowing__quickpotAmount--required'));
    styleNumber($('addSowing__cropAmount--required'));
    styleNumber($('addSowing__totalCropAmount--required'));

    $('addSowing__crops').innerHTML = head1 + head2 + rows + finalRow;
    $$('.addSowing__amountPerBox').forEach(el => styleNumber(el));
    $$('.addSowing__availablePerBox').forEach(el => styleNumber(el));
    $$('.addSowing__overProduction').forEach(el => styleNumber(el));
    $$('.addSowing__cropAmount--rounded').forEach(el => styleNumber(el));
    $('addSowing__crops').style.display = '';

    const hideTableColumn = (tableSelector, column) => {
      $$(`${tableSelector} td:nth-child(${column})`).forEach(el => {
        el.style.display = 'none';
      });
    };

    const showTableColumn = (tableSelector, column) => {
      $$(`${tableSelector} td:nth-child(${column})`).forEach(el => {
        el.style.display = '';
      });
    };

    veggie.isSingleCrop
      ? hideTableColumn('#addSowing__crops', 3)
      : showTableColumn('#addSowing__crops', 3);
    veggie.isSingleCrop
      ? hideTableColumn('#addSowing__crops', 5)
      : showTableColumn('#addSowing__crops', 5);

    handleChangeSowingForm();
    return;
  }
  if (cultureIsSelected()) {
    const options = [...data.varieties]
      .map(
        variety =>
          `<option value="${variety.id}">${variety.name} (Beetdauer: ${variety.bedDuration} Tage)</option>`
      )
      .join('');
    showVeggieName(data.culture);
    hideCultureSelect();
    $(
      'addSowing__variety'
    ).innerHTML = `<option>Sorte auswählen</option>${options}`;
    $('addSowing__variety').style.display = '';
    return;
  }
  if (nothingIsSelected()) {
    clearSowingForm();
    const options = [...data.cultures]
      .map(culture => `<option value="${culture}">${culture}</option>`)
      .join('');
    $(
      'addSowing__culture'
    ).innerHTML = `<option>Kultur auswählen</option>${options}`;
    $('addSowing__reset').addEventListener('click', resetSowingForm);
    return;
  }
};

const renderBoxes = (boxes, sowings) => {
  const boxesHtml = boxes
    .map(box => {
      let boxPrice = 0;
      const ingredientsHtml = [...sowings]
        .sort((a, b) => {
          const veggieNameA = a.veggie.fullName.toUpperCase();
          const veggieNameB = b.veggie.fullName.toUpperCase();
          if (veggieNameA < veggieNameB) return -1;
          if (veggieNameA > veggieNameB) return 1;
          return 0;
        })
        .map(sowing =>
          sowing.crops
            .filter(
              crop =>
                crop.date.getTime() === box.date.getTime() &&
                crop.salesChannel === 'Box' &&
                crop.amount > 0
            )
            .map(crop => {
              const cropPrice =
                Math.round(
                  crop.amount * sowing.veggie.sellingPricePerUnit * 100
                ) / 100;
              boxPrice += cropPrice;
              return `<tr class="box__ingredient">
            <td style="display:none;" class="box__veggieId">${sowing.veggie.id}</td>
            <td>${sowing.veggie.fullName}</td>
            <td>${crop.amount} ${sowing.veggie.harvestUnit}</td>
            <td>${cropPrice} €</td>
            <td>&#128465;</td>
            </tr>`;
            })
            .join('')
        )
        .join('');
      const boxHtml = `<div class="box">
    <div class="box__date">${dateToString(box.date)}</div>
    <table>${ingredientsHtml}<tr><td></td><td></td><td>${dotToComma(
        Math.round(boxPrice * 100) / 100
      )} €</td><td></td></tr></table>
    <div class="button box__addVeggieButton">&#65291; Gemüse</div>
  </div>`;
      return boxHtml;
    })
    .join('');
  $('boxes__wrapper').innerHTML = boxesHtml;
  $$('.box__addVeggieButton').forEach(button =>
    button.addEventListener('click', e =>
      showSowingForm({
        firstCropDate:
          e.target.parentNode.querySelector('.box__date')?.innerHTML,
      })
    )
  );
  // lastClickedBox
  $$('.box').forEach(box =>
    box.addEventListener('click', event => {
      const lastClicked = event.target
        .closest('.box')
        .querySelector('.box__date').innerHTML;
      sessionStorage.setItem('lastClickedBox', lastClicked);
      renderBoxes(boxes, sowings);
    })
  );
  [...$$('.box__date')].forEach(boxDate =>
    boxDate.classList.remove('box--lastClicked')
  );
  [...$$('.box__date')]
    .find(
      boxDate =>
        boxDate.textContent === sessionStorage.getItem('lastClickedBox')
    )
    ?.closest('.box')
    .classList.add('box--lastClicked');
  // Ingredient doubleclickable
  [...$$('.box__ingredient')].forEach(tr =>
    tr.addEventListener('dblclick', event => {
      const veggieId = event.target
        .closest('.box__ingredient')
        .querySelector('.box__veggieId').innerHTML;
      const cropDate = stringToDate(
        event.target.closest('.box').querySelector('.box__date').innerHTML
      );
      const sowing = sowings
        .filter(sowing => sowing.veggie.id === Number(veggieId))
        .find(sowing =>
          sowing.crops.some(crop => crop.date.getTime() === cropDate.getTime())
        );
      const firstCropDate = dateToString(sowing.crops[0].date);
      showSowingForm({firstCropDate, veggieId});
    })
  );
};

const renderMarketDays = (marketDays, sowings) => {
  const marketDaysHtml = marketDays
    .map(marketDay => {
      let marketDayPrice = 0;
      const ingredientsHtml = [...sowings]
        .sort((a, b) => {
          const veggieNameA = a.veggie.fullName.toUpperCase();
          const veggieNameB = b.veggie.fullName.toUpperCase();
          if (veggieNameA < veggieNameB) return -1;
          if (veggieNameA > veggieNameB) return 1;
          return 0;
        })
        .map(sowing =>
          sowing.crops
            .filter(
              crop =>
                crop.date.getTime() === marketDay.date.getTime() &&
                crop.salesChannel === 'MarketDay' &&
                crop.amount > 0
            )
            .map(crop => {
              const cropPrice =
                Math.round(
                  crop.amount * sowing.veggie.sellingPricePerUnit * 100
                ) / 100;
              marketDayPrice += cropPrice;
              return `<tr class="marketDay__ingredient">
            <td style="display:none;" class="marketDay__veggieId">${sowing.veggie.id}</td>
            <td>${sowing.veggie.fullName}</td>
            <td>${crop.amount} ${sowing.veggie.harvestUnit}</td>
            <td>${cropPrice} €</td>
            <td>&#128465;</td>
            </tr>`;
            })
            .join('')
        )
        .join('');
      const marketDayHtml = `<div class="marketDay">
    <div class="marketDay__date">${dateToString(marketDay.date)}</div>
    <table>${ingredientsHtml}<tr><td></td><td></td><td>${dotToComma(
        Math.round(marketDayPrice * 100) / 100
      )} €</td><td></td></tr></table>
    <div class="button marketDay__addVeggieButton">&#65291; Gemüse</div>
  </div>`;
      return marketDayHtml;
    })
    .join('');
  $('marketDays__wrapper').innerHTML = marketDaysHtml;
  $$('.marketDay__addVeggieButton').forEach(button =>
    button.addEventListener('click', e =>
      showSowingForm({
        firstCropDate:
          e.target.parentNode.querySelector('.marketDay__date')?.innerHTML,
      })
    )
  );
  // lastClickedMarketDay
  $$('.marketDay').forEach(marketDay =>
    marketDay.addEventListener('click', event => {
      const lastClicked = event.target
        .closest('.marketDay')
        .querySelector('.marketDay__date').innerHTML;
      sessionStorage.setItem('lastClickedMarketDay', lastClicked);
      renderMarketDays(marketDays, sowings);
    })
  );
  [...$$('.marketDay__date')].forEach(marketDayDate =>
    marketDayDate.classList.remove('marketDay--lastClicked')
  );
  [...$$('.marketDay__date')]
    .find(
      marketDayDate =>
        marketDayDate.textContent ===
        sessionStorage.getItem('lastClickedMarketDay')
    )
    ?.closest('.marketDay')
    .classList.add('marketDay--lastClicked');
  // Ingredient doubleclickable
  [...$$('.marketDay__ingredient')].forEach(tr =>
    tr.addEventListener('dblclick', event => {
      const veggieId = event.target
        .closest('.marketDay__ingredient')
        .querySelector('.marketDay__veggieId').innerHTML;
      const cropDate = stringToDate(
        event.target.closest('.marketDay').querySelector('.marketDay__date')
          .innerHTML
      );
      const sowing = sowings
        .filter(sowing => sowing.veggie.id === Number(veggieId))
        .find(sowing =>
          sowing.crops.some(crop => crop.date.getTime() === cropDate.getTime())
        );
      const firstCropDate = dateToString(sowing.crops[0].date);
      showSowingForm({firstCropDate, veggieId});
    })
  );
};

const renderSowings = sowings => {
  const htmlSowings = sowings
    .map(
      sowing =>
        `<li title="Ernten:${[...sowing.crops]
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map(crop =>
            crop.amount > 0
              ? `&#10;${dateToString(crop.date)}: ${crop.amount} ${
                  sowing.veggie.harvestUnit
                } für ${crop.salesChannel}`
              : ''
          )
          .join('')}">${dateToString(sowing.sowingDate)}: ${
          sowing.seedAmount
        } ${sowing.veggie.fullName}</li>`
    )
    .join('');
  $('sowings').innerHTML = `<ul class="--listStyleNone">${htmlSowings}</ul>`;
};

const showEieruhr = () => {
  document.querySelector('body').className = 'wait';
};

const init = () => {
  $('addBoxes__h3').addEventListener('click', openMultiBox);
  $('addBoxes__close').addEventListener('click', closeMultiBox);
  $('addBoxes__close').click();
  $('addMarketDays__h3').addEventListener('click', openAddMarketDays);
  $('addMarketDays__close').addEventListener('click', closeAddMarketDays);
  $('addMarketDays__close').click();
  $('addBox__h3').addEventListener('click', openAddBox);
  $('addBox__close').addEventListener('click', closeAddBox);
  $('addBox__close').click();
  $('addMarketDay__h3').addEventListener('click', openAddMarketDay);
  $('addMarketDay__close').addEventListener('click', closeAddMarketDay);
  $('addMarketDay__close').click();
  $('addSowing').style.display = 'none';
};

export {
  renderSowingForm,
  renderBoxPreview,
  renderMarketDaysPreview,
  renderBoxes,
  renderMarketDays,
  renderSowings,
  hideMultiBoxForm,
  hideAddBox,
  hideAddMarketDaysForm,
  hideAddMarketDayForm,
  handleMultiBoxPreview,
  handleMultiBoxSave,
  handleAddMarketDaysPreview,
  handleAddMarketDaysSave,
  handleAddBox,
  handleAddMarketDay,
  handleAddSowing,
  handleCulture,
  handleVariety,
  handleChangeSowingForm,
  showEieruhr,
  init,
};
