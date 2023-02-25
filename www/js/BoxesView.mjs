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
      firstDay: $('addBoxes__firstDay').value,
      lastDay: $('addBoxes__lastDay').value,
      interval: $('addBoxes__interval').value,
    });
  $('addBoxes__firstDay').addEventListener('change', myFunc);
  $('addBoxes__lastDay').addEventListener('change', myFunc);
  $('addBoxes__interval').addEventListener('change', myFunc);
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
    $('addBox__save').style.display = 'none';
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
    _ => ($('addBox__save').style.display = '')
  );
  $('addBox__save').addEventListener('click', _ =>
    handler(boxes, new Date($('addBox__inputDate').value))
  );
};

const handleCulture = handler =>
  $('addSowing__culture')?.addEventListener('change', e => {
    handler({
      culture: e.target.value,
      firstCropDate: stringToDate($('addSowing__firstCropDate').innerHTML),
    });
    $('addSowing').scrollIntoView();
  });

const handleVariety = handler =>
  $('addSowing__variety')?.addEventListener('change', e =>
    handler({
      veggieId: e.target.value,
      firstCropDate: stringToDate($('addSowing__firstCropDate').innerHTML),
    })
  );

const handleChangeSowingForm = handler => {
  const getCrops = () =>
    [...$$('.addSowing__amountPerBox')].map(node => ({
      date: stringToDate(node.id.substr(-10)),
      boxAmount: commaToDot(node.value),
    }));
  const getSowingFormData = event => ({
    target:
      event.target.id === 'quickpots__floorArrow'
        ? 'quickpots__floor'
        : event.target.id,
    veggieId: $('addSowing__variety').value,
    sowingDate: stringToDate($('addSowing__date').innerHTML),
    seedAmount: commaToDot($('addSowing__seedAmount').value),
    bedLength: commaToDot($('addSowing__bedLength').value),
    quickpotAmount: commaToDot($('addSowing__quickpotAmount').value),
    crops: getCrops(),
  });
  HANDLER.changeSowingForm = handler
    ? event => handler(getSowingFormData(event))
    : HANDLER.changeSowingForm;
  $('addSowing__seedAmount').addEventListener(
    'change',
    HANDLER.changeSowingForm
  );
  $('addSowing__seedAmount').setAttribute('autocomplete', 'off');
  $('addSowing__seedAmount').addEventListener('click', e => e.target.select());
  $('addSowing__bedLength').addEventListener(
    'change',
    HANDLER.changeSowingForm
  );
  $('addSowing__bedLength').setAttribute('autocomplete', 'off');
  $('addSowing__bedLength').addEventListener('click', e => e.target.select());
  $('addSowing__quickpotAmount').addEventListener(
    'change',
    HANDLER.changeSowingForm
  );
  $('addSowing__quickpotAmount').setAttribute('autocomplete', 'off');
  $('addSowing__quickpotAmount').addEventListener('click', e =>
    e.target.select()
  );
  $('quickpots__floor')?.addEventListener('click', HANDLER.changeSowingForm);
  $('quickpots__ceil')?.addEventListener('click', HANDLER.changeSowingForm);
  $$('.addSowing__amountPerBox').forEach(crop => {
    crop.addEventListener('change', HANDLER.changeSowingForm);
    crop.setAttribute('autocomplete', 'off');
    crop.addEventListener('click', e => e.target.select());
  });
  $('addSowing').scrollIntoView();
};

const hideMultiBoxForm = () => {
  $('addBoxes__wrapper').style.display = 'none';
};

const hideAddBox = () => {
  $('addBox__wrapper').style.display = 'none';
};

const hideSowingForm = () => {
  $('addSowing').style.display = 'none';
};

const showSowingForm = e => {
  resetSowingForm();
  $('addSowing__firstCropDate').innerHTML =
    e.target.parentNode.querySelector('.box__date').innerHTML;
  $('addSowing__dateWrapper').style.display = 'none';
  $('addSowing__cropsWrapper').style.display = 'none';
  $('addSowing').style.display = '';
  $('addSowing').scrollIntoView();
};

const resetSowingForm = (e = undefined) => {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  $('addSowing__cropsWrapper').innerHTML = '';
  $('addSowing__cropsWrapper').style.display = 'none';
  $('quickpots').innerHTML = '';
  $('addSowing__seedAmount').value = 0;
  $('addSowing__bedLength').value = 0;
  $('addSowing__quickpotAmount').value = 0;
  $('addSowing__requirements').style.display = 'none';
  $('addSowing__veggieName').style.display = 'none';
  $('addSowing__variety').style.display = 'none';
  $('addSowing__culture').style.display = '';
  $('addSowing__date').innerHTML = '';
  $('addSowing__dateWrapper').style.display = 'none';
  $('addSowing__firstCropDateWrapper').style.display = 'none';
  $('addSowing__culture').selectedIndex = 0;
  $('addSowing__variety').selectedIndex = 0;
  $('addSowing').scrollIntoView();
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
  $('addBoxes__wrapper').style.margin = '0';
  $('addBoxes__wrapper').style.padding = '0';
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
  $('addBox__save').style.display = 'none';
  $('addBox__h3').classList.add('button');
  $('addBox__wrapper').style.borderColor = 'transparent';
  $('addBox__wrapper').style.padding = '0';
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

  const showQuickpotInfos = (veggie, sowing) => {
    $('addSowing__quickpotAmount').value = sowing.quickpotAmount;
    $('addSowing__quickpotSize').innerHTML = `Größe ${veggie.quickpotSize}`;
    $('addSowing__quickpotAmount').style.display = '';
    $('addSowing__quickpotSize').style.display = '';
    $('addSowing__quickpotAmount').labels[0].style.display = '';
    renderQuickpots(veggie, sowing.seedAmount);
  };

  const hideQuickpotInfos = () => {
    $('addSowing__quickpotAmount').value = 0;
    $('addSowing__quickpotSize').innerHTML = ``;
    $('addSowing__quickpotAmount').style.display = 'none';
    $('addSowing__quickpotSize').style.display = 'none';
    $('addSowing__quickpotAmount').labels[0].style.display = 'none';
  };

  // event listeners
  $('addSowing__close').addEventListener('click', _ => {
    resetSowingForm();
    hideSowingForm();
  });

  // culture and variety are selected
  if (varietyIsSelected()) {
    // variables
    const {sowing, numberOfBoxes} = data;
    const veggie = sowing.veggie;
    const roundedCropAmount = Math.floor(sowing.cropAmount * 100) / 100 || 0;
    /* const roundedBoxAmount =
      Math.floor((sowing.cropAmount / numberOfBoxes) * 100) / 100 || 0; */
    // execute
    hideCultureSelect();
    hideVarietySelect();
    setVarietySelectValue(veggie.id);
    showVeggieName(veggie.fullName);
    showSowingDate(sowing.sowingDate);
    // sowingRequirements
    $('addSowing__seedAmount').value = sowing.seedAmount;
    $('addSowing__bedLength').value = sowing.bedLength;
    styleNumber($('addSowing__seedAmount'));
    styleNumber($('addSowing__bedLength'));
    styleNumber($('addSowing__quickpotAmount'));
    $('addSowing__requirements').style.display = '';
    veggie.preGrow ? showQuickpotInfos(veggie, sowing) : hideQuickpotInfos();
    // crops
    const head = `<div class="head">Ernte-Termin</div>
      <div class="head">Inhalt Kiste</div>
      <div class="head">frei pro Kiste</div>
      <div class="head">Überproduktion</div>
      <div class="head">Summe</div>`;

    const rows = sowing.possibleCropDates
      .map((date, index) => {
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
               id="addSowing__amountPerBox--${dateToString(date)}"
               class="addSowing__amountPerBox"
               value="${dotToComma(boxAmount)}"> ${veggie.harvestUnit}
      </div>
      <div><span class="addSowing__availablePerBox">${
        Math.floor(unusedPerBox * 100) / 100
      }</span> ${veggie.harvestUnit}</div>
      <div><span class="addSowing__overProduction">${overProduction}</span> ${
          veggie.harvestUnit
        }</div>
      <div><span class="addSowing__cropAmount--rounded">${roundedCropAmount}</span> ${
          veggie.harvestUnit
        }</div>`;
      })
      .join('');

    const finalRow = `<div>Summe</div>
      <div>Menge Einheit</div>
      <div>unused Einheit</div>
      <div>über Einheit</div>
      <div>Summe Einheit</div>
      <div></div>`;

    $('addSowing__cropsWrapper').innerHTML = head + rows + finalRow;
    $$('.addSowing__amountPerBox').forEach(el => styleNumber(el));
    $$('.addSowing__availablePerBox').forEach(el => styleNumber(el));
    $$('.addSowing__overProduction').forEach(el => styleNumber(el));
    $$('.addSowing__cropAmount--rounded').forEach(el => styleNumber(el));
    $('addSowing__cropsWrapper').style.display = '';
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
    resetSowingForm();
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
  $('addBoxes__h3').addEventListener('click', openMultiBox);
  $('addBoxes__close').addEventListener('click', closeMultiBox);
  $('addBoxes__close').click();
  $('addBox__h3').addEventListener('click', openAddBox);
  $('addBox__close').addEventListener('click', closeAddBox);
  $('addBox__close').click();
  $('addSowing').style.display = 'none';
};

export {
  renderSowingForm,
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
