import {
  commaToDot,
  dotToComma,
  dateToString,
  dateToWeekday,
  stringToDate,
  addDaysToDate,
} from './Utils.mjs';

const HANDLER = {};

const $ = id => document.getElementById(id);
const $$ = query => document.querySelectorAll(query);

const handleMultiBoxPreview = handler => {
  const myFunc = _ =>
    handler({
      firstDay: $('firstBoxDay').value,
      lastDay: $('lastBoxDay').value,
      interval: $('boxInterval').value,
    });
  $('firstBoxDay').addEventListener('change', myFunc);
  $('lastBoxDay').addEventListener('change', myFunc);
  $('boxInterval').addEventListener('change', myFunc);
};

const handleMultiBoxSave = handler => {
  $('planMultiBoxes__saveButton').addEventListener('click', _ =>
    handler({
      firstDay: $('firstBoxDay').value,
      lastDay: $('lastBoxDay').value,
      interval: $('boxInterval').value,
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
  return allDaysInYear.filter(date => date.getDay() === weekday);
};

const handleAddBox = (handler, boxes) => {
  const weekday = boxes[0]?.date.getDay();
  $('addBox__inputYear').addEventListener('change', e => {
    const year = Number(e.target.value);
    $('addBox__saveButton').style.display = 'none';
    $('addBox__inputDate').style.display = '';
    $('addBox__inputDateLabel').style.display = '';
    const boxTimes = boxes.map(box => box.date.getTime());
    const possibleDates = getAllDatesOfWeekdayOfYear(weekday, year).filter(
      date => !boxTimes.includes(date.getTime())
    );
    const dateOptions = possibleDates.map(
      date => `<option value="${date}">${dateToString(date)}</option>`
    );
    $(
      'addBox__inputDate'
    ).innerHTML = `<option selected></option>${dateOptions}`;
  });
  $('addBox__inputDate').addEventListener(
    'change',
    _ => ($('addBox__saveButton').style.display = '')
  );
  $('addBox__saveButton').addEventListener('click', _ =>
    handler(boxes, new Date($('addBox__inputDate').value))
  );
};

const handleCulture = handler =>
  $('culture')?.addEventListener('change', e =>
    handler({
      culture: e.target.value,
      firstCropDate: stringToDate($('sowingForm__firstCropDate').innerHTML),
    })
  );

const handleVariety = handler =>
  $('variety')?.addEventListener('change', e =>
    handler({
      veggieId: e.target.value,
      firstCropDate: stringToDate($('sowingForm__firstCropDate').innerHTML),
    })
  );

const handleChangeSowingForm = handler => {
  const getCrops = () =>
    [...$$('.sowingForm__boxAmount')].map(node => ({
      date: stringToDate(node.id.substr(-10)),
      boxAmount: commaToDot(node.value),
    }));
  const getSyncedCrops = () => {
    const checked = [...$$('.sowingForm__syncCropCheckbox')].map(
      node => node.checked
    );
    return checked[0] ? checked.map(_ => true) : checked;
  };
  const getSowingFormData = event => ({
    target:
      event.target.id === 'floorQuickpotArrow'
        ? 'floorQuickpot'
        : event.target.id,
    veggieId: $('variety').value,
    sowingDate: stringToDate($('sowingForm__sowingDate').innerHTML),
    cropAmount: commaToDot($('cropAmount').value),
    boxAmount: commaToDot($('boxAmount').value),
    seedAmount: commaToDot($('seedAmount').value),
    bedLength: commaToDot($('bedLength').value),
    quickpotAmount: commaToDot($('quickpotAmount').value),
    crops: getCrops(),
    syncedCrops: getSyncedCrops(),
  });
  HANDLER.changeSowingForm = handler
    ? event => handler(getSowingFormData(event))
    : HANDLER.changeSowingForm;
  $('cropAmount').addEventListener('change', HANDLER.changeSowingForm);
  $('cropAmount').setAttribute('autocomplete', 'off');
  $('cropAmount').addEventListener('click', e => e.target.select());
  $('boxAmount').addEventListener('change', HANDLER.changeSowingForm);
  $('boxAmount').setAttribute('autocomplete', 'off');
  $('boxAmount').addEventListener('click', e => e.target.select());
  $('seedAmount').addEventListener('change', HANDLER.changeSowingForm);
  $('seedAmount').setAttribute('autocomplete', 'off');
  $('seedAmount').addEventListener('click', e => e.target.select());
  $('bedLength').addEventListener('change', HANDLER.changeSowingForm);
  $('bedLength').setAttribute('autocomplete', 'off');
  $('bedLength').addEventListener('click', e => e.target.select());
  $('quickpotAmount').addEventListener('change', HANDLER.changeSowingForm);
  $('quickpotAmount').setAttribute('autocomplete', 'off');
  $('quickpotAmount').addEventListener('click', e => e.target.select());
  $('floorQuickpot')?.addEventListener('click', HANDLER.changeSowingForm);
  $('ceilQuickpot')?.addEventListener('click', HANDLER.changeSowingForm);
  $$('.sowingForm__boxAmount').forEach(crop => {
    crop.addEventListener('change', HANDLER.changeSowingForm);
    crop.setAttribute('autocomplete', 'off');
    crop.addEventListener('click', e => e.target.select());
  });
  $$('.sowingForm__syncCropCheckbox').forEach(checkbox =>
    checkbox.addEventListener('change', HANDLER.changeSowingForm)
  );
};

const hideMultiBoxForm = () => {
  $('planMultiBoxes__wrapper').style.display = 'none';
};

const hideAddBox = () => {
  $('addBox__wrapper').style.display = 'none';
};

const hideSowingForm = () => {
  $('sowing').style.display = 'none';
};

const showSowingForm = e => {
  resetSowingForm();
  $('sowingForm__firstCropDate').innerHTML =
    e.target.parentNode.querySelector('.box__date').innerHTML;
  $('sowingForm__sowingDateWrapper').style.display = 'none';
  $('sowingForm__cropsWrapper').style.display = 'none';
  $('sowing').style.display = '';
};

const resetSowingForm = () => {
  $('cropAmount').labels[0].style.display = 'none';
  $('cropAmount').style.display = 'none';
  $('harvestUnit').style.display = 'none';
  $('sowingForm__cropsWrapper').innerHTML = '';
  $('sowingForm__cropsWrapper').style.display = 'none';
  $('quickpotImages').innerHTML = '';
  $('cropAmount').value = 0;
  $('boxAmount').value = 0;
  $('seedAmount').value = 0;
  $('bedLength').value = 0;
  $('quickpotAmount').value = 0;
  $('sowingInfos').style.display = 'none';
  $('veggieName').style.display = 'none';
  $('variety').style.display = 'none';
  $('culture').style.display = '';
  $('sowingForm__sowingDate').innerHTML = '';
  $('sowingForm__sowingDateWrapper').style.display = 'none';
  $('sowingForm__firstCropDateWrapper').style.display = 'none';
  $('culture').selectedIndex = 0;
  $('variety').selectedIndex = 0;
};

const openMultiBox = () => {
  $('planMultiBoxes__close').style.display = '';
  $('planMultiBoxes__inputWrapper').style.display = '';
  $('planMultiBoxes__dates').style.display = '';
  $('planMultiBoxes__saveButton').style.display = '';
  $('planMultiBoxes__h3').classList.remove('button');
  $('planMultiBoxes__wrapper').style.borderColor = '';
  $('planMultiBoxes__wrapper').style.margin = '';
  $('planMultiBoxes__wrapper').style.padding = '';
};

const closeMultiBox = e => {
  e.stopPropagation();
  $('firstBoxDay').value = '';
  $('lastBoxDay').value = '';
  $('boxInterval').value = 7;
  renderBoxPreview([]);
  $('planMultiBoxes__close').style.display = 'none';
  $('planMultiBoxes__inputWrapper').style.display = 'none';
  $('planMultiBoxes__dates').style.display = 'none';
  $('planMultiBoxes__saveButton').style.display = 'none';
  $('planMultiBoxes__h3').classList.add('button');
  $('planMultiBoxes__wrapper').style.borderColor = 'transparent';
  $('planMultiBoxes__wrapper').style.margin = '0';
  $('planMultiBoxes__wrapper').style.padding = '0';
};

const openAddBox = () => {
  const currentYear = new Date().getFullYear();
  const next30years = [...Array(30)].map((_, key) => key + currentYear);
  const yearOptions = next30years
    .map(year => `<option value="${year}">${year}</option>`)
    .join('');
  $('addBox__inputYear').innerHTML = `<option selected></option>${yearOptions}`;
  $('addBox__close').style.display = '';
  $('addBox__inputWrapper').style.display = '';
  $('addBox__h3').classList.remove('button');
  $('addBox__wrapper').style.borderColor = '';
  $('addBox__wrapper').style.margin = '';
  $('addBox__wrapper').style.padding = '';
};

const closeAddBox = e => {
  e.stopPropagation();
  $('addBox__inputYear').value = '';
  $('addBox__inputDate').value = '';
  $('addBox__close').style.display = 'none';
  $('addBox__inputWrapper').style.display = 'none';
  $('addBox__inputDate').style.display = 'none';
  $('addBox__inputDate').innerHTML = '';
  $('addBox__inputDateLabel').style.display = 'none';
  $('addBox__saveButton').style.display = 'none';
  $('addBox__h3').classList.add('button');
  $('addBox__wrapper').style.borderColor = 'transparent';
  $('addBox__wrapper').style.margin = '0';
  $('addBox__wrapper').style.padding = '0';
};

const renderBoxPreview = dates => {
  const numberOfBoxes = dates.length;
  $('planMultiBoxes__saveButton').style.color =
    numberOfBoxes === 0 ? 'rgb(170,170,170)' : 'rgb(0,0,0)';
  const buttonText =
    numberOfBoxes === 1
      ? `1 Kiste hinzufügen`
      : `${numberOfBoxes} Kisten hinzufügen`;
  $('planMultiBoxes__saveButton').innerHTML = buttonText;
  const datesHtml = dates
    .reduce(
      (datesString, date, i, self) =>
        date.getMonth() !== self[i - 1]?.getMonth()
          ? [...datesString, `<br>[${dateToString(date)}]`]
          : [...datesString, `[${dateToString(date)}]`],
      []
    )
    .join(' ');
  $('planMultiBoxes__dates').innerHTML = datesHtml;
};

const renderQuickpots = (size, filledSlots) => {
  if (filledSlots <= 0) return;
  const emptySlots = filledSlots % size ? size - (filledSlots % size) : 0;
  const filledSlotHtml = '<div class="slot slot--filled"></div>';
  const emptySlotHtml = '<div class="slot slot--empty"></div>';
  const buttonsHtml = `<div class="quickpots__buttonWrapper">
      <div class="button" id="floorQuickpot">-<div class="mirror" id="floorQuickpotArrow">&#x2935;</div></div>
      <div class="button" id="ceilQuickpot">+&#x2935;</div>
    </div>`;
  const filledQuickpotHtml = `<div class="quickpot quickpot${size}">${filledSlotHtml.repeat(
    size
  )}</div>`;
  const partialQuickpot = emptySlots
    ? `<div class="quickpot quickpot${size}">${filledSlotHtml.repeat(
        size - emptySlots
      )}${emptySlotHtml.repeat(emptySlots)}</div>${buttonsHtml}`
    : '';
  $('quickpotImages').innerHTML =
    filledQuickpotHtml.repeat(Math.floor(filledSlots / size)) + partialQuickpot;
};

const renderSowingForm = data => {
  const styleNumber = element => {
    const value =
      element.value !== undefined ? element.value : element.innerHTML;
    element.style.color = value < 0 ? 'rgb(255,0,0)' : '';
    element.value = dotToComma(element.value);
    element.innerHTML = dotToComma(element.innerHTML);
  };
  $('sowingForm__close').addEventListener('click', _ => {
    resetSowingForm();
    hideSowingForm();
  });
  if (data.sowing && data.numberOfBoxes) {
    const {sowing, numberOfBoxes, syncedCrops = [false, true]} = data;
    const veggie = sowing.veggie;
    if (veggie.isSingleCrop) {
      $('cropAmount').labels[0].style.display = '';
      $('cropAmount').style.display = '';
      $('harvestUnit').style.display = '';
    }
    $('culture').style.display = 'none';
    $('variety').style.display = 'none';
    $('variety').value = veggie.id;
    $('veggieName').innerHTML = veggie.fullName;
    $('veggieName').style.display = '';
    $('sowingForm__sowingDate').innerHTML = dateToString(sowing.sowingDate);
    $('sowingForm__sowingDateWrapper').style.display = '';
    // sowingInfos
    $('cropAmount').labels[0].textContent = veggie.isSingleCrop
      ? 'Erntemenge gesamt'
      : 'Erntemenge pro Ernte';
    const roundedCropAmount = Math.floor(sowing.cropAmount * 100) / 100 || 0;
    const roundedBoxAmount =
      Math.floor((sowing.cropAmount / numberOfBoxes) * 100) / 100 || 0;
    $('cropAmount').value = roundedCropAmount;
    $('harvestUnit').innerHTML = veggie.harvestUnit;
    $('boxAmountHarvestUnit').innerHTML = veggie.harvestUnit;
    $('boxAmount').value = roundedBoxAmount;
    $('seedAmount').value = sowing.seedAmount;
    $('bedLength').value = sowing.bedLength;
    $('quickpotAmount').value = sowing.quickpotAmount;
    $('quickpotSize').innerHTML = `Größe ${veggie.quickpotSize}`;
    if (veggie.preGrow) {
      $('quickpotAmount').style.display = '';
      $('quickpotSize').style.display = '';
      $('quickpotAmount').labels[0].style.display = '';
    } else {
      $('quickpotAmount').style.display = 'none';
      $('quickpotSize').style.display = 'none';
      $('quickpotAmount').labels[0].style.display = 'none';
    }
    $('sowingInfos').style.display = '';
    styleNumber($('cropAmount'));
    styleNumber($('boxAmount'));
    styleNumber($('seedAmount'));
    styleNumber($('bedLength'));
    styleNumber($('quickpotAmount'));
    if (veggie.preGrow) renderQuickpots(veggie.quickpotSize, sowing.seedAmount);
    // crops
    const head = `<div class="head">Ernte-Termin</div>
    <div class="head">Inhalt Kiste</div>
    <div class="head">frei pro Kiste</div>
    <div class="head">Überproduktion</div>
    <div class="head">Summe</div>
    <input type="checkbox"
           name="syncCrop--all"
           id="syncCrop--all"
           class="sowingForm__syncCropCheckbox"
           ${syncedCrops[0] ? 'checked' : ''}>`;
    const rows = sowing.possibleCropDates
      .map((date, index) => {
        const syncedCrop = syncedCrops[index + 1];
        const boxAmount =
          Math.round(
            (sowing.crops.find(crop => crop.date.getTime() === date.getTime())
              ?.amount / numberOfBoxes || 0) * 100
          ) / 100;
        const maxBoxAmount = sowing.cropAmount / numberOfBoxes;
        const unusedPerBox = maxBoxAmount - boxAmount;
        const overProduction =
          Math.round(unusedPerBox * numberOfBoxes * 100) / 100;
        return `<div>${dateToWeekday(date)}, ${dateToString(date)}</div>
    <div>
      <input type="text"
             name=""
             id="sowingForm__boxAmount--${dateToString(date)}"
             class="sowingForm__boxAmount"
             value="${dotToComma(boxAmount)}"> ${veggie.harvestUnit}
    </div>
    <div><span class="sowingForm__unusedPerBox">${
      Math.floor(unusedPerBox * 100) / 100
    }</span> ${veggie.harvestUnit}</div>
    <div><span class="sowingForm__overProduction">${overProduction}</span> ${
          veggie.harvestUnit
        }</div>
    <div><span class="sowingForm__roundedCropAmount">${roundedCropAmount}</span> ${
          veggie.harvestUnit
        }</div>
    <input type="checkbox"
           name="syncCrop--${dateToString(date)}"
           id="syncCrop--${dateToString(date)}"
           class="sowingForm__syncCropCheckbox"
           ${syncedCrop ? 'checked' : ''}>`;
      })
      .join('');
    $('sowingForm__cropsWrapper').innerHTML = head + rows;
    $$('.sowingForm__boxAmount').forEach(el => styleNumber(el));
    $$('.sowingForm__unusedPerBox').forEach(el => styleNumber(el));
    $$('.sowingForm__overProduction').forEach(el => styleNumber(el));
    $$('.sowingForm__roundedCropAmount').forEach(el => styleNumber(el));
    $('sowingForm__cropsWrapper').style.display = '';
    handleChangeSowingForm();
    return;
  }
  if (data.culture && data.varieties) {
    const options = [...data.varieties]
      .map(variety => `<option value="${variety.id}">${variety.name}</option>`)
      .join('');
    $('veggieName').innerHTML = data.culture;
    $('veggieName').style.display = '';
    $('culture').style.display = 'none';
    $('variety').innerHTML = `<option>Sorte auswählen</option>${options}`;
    $('variety').style.display = '';
    return;
  }
  if (data.cultures) {
    resetSowingForm();
    const options = [...data.cultures]
      .map(culture => `<option value="${culture}">${culture}</option>`)
      .join('');
    $('culture').innerHTML = `<option>Kultur auswählen</option>${options}`;
    $('resetSowingForm').addEventListener('click', resetSowingForm);
    return;
  }
};

const renderBoxes = boxes => {
  const boxesHtml = boxes
    .map(box => {
      const ingredientsHtml = box.ingredients
        .map(
          ingredient => `<tr>
    <td>${ingredient.veggie.fullName}</td>
    <td>${ingredient.amount} ${ingredient.veggie.harvestUnit}</td>
    <td>&#128465;</td>
  </tr>`
        )
        .join('');
      const boxHtml = `<div class="box">
    <div class="box__date">${dateToString(box.date)}</div>
    <table>${ingredientsHtml}</table>
    <div class="button box__addVeggieButton">&#65291; Gemüse</div>
  </div>`;
      return boxHtml;
    })
    .join('');
  $('boxes__wrapper').innerHTML = boxesHtml;
  $$('.box__addVeggieButton').forEach(button =>
    button.addEventListener('click', showSowingForm)
  );
};

const renderSowings = sowings => {
  $('sowings').innerHTML = sowings;
};

const showEieruhr = () => {
  document.querySelector('body').className = 'wait';
};

const init = () => {
  $('planMultiBoxes__h3').addEventListener('click', openMultiBox);
  $('planMultiBoxes__close').addEventListener('click', closeMultiBox);
  $('planMultiBoxes__close').click();
  $('addBox__h3').addEventListener('click', openAddBox);
  $('addBox__close').addEventListener('click', closeAddBox);
  $('addBox__close').click();
  $('sowing').style.display = 'none';
};

export {
  renderSowingForm,
  renderQuickpots,
  renderBoxPreview,
  renderBoxes,
  renderSowings,
  hideMultiBoxForm,
  hideAddBox,
  handleMultiBoxPreview,
  handleMultiBoxSave,
  handleAddBox,
  handleCulture,
  handleVariety,
  handleChangeSowingForm,
  showEieruhr,
  init,
};
