import {commaToDot, dotToComma, dateToString, addDaysToDate} from './Utils.mjs';

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
    tempDate = new Date(addDaysToDate(tempDate, 1));
  }
  return allDaysInYear.filter(date => date.getDay() === weekday);
};

const handleAddBox = (handler, boxes) => {
  const weekday = boxes[0]?.date.getDay();
  $('addBox__inputYear').addEventListener('change', e => {
    const year = e.target.value;
    $('addBox__inputYear').style.display = 'none';
    $('addBox__inputYearLabel').style.display = 'none';
    $('addBox__inputDate').style.display = '';
    $('addBox__inputDateLabel').style.display = '';
    // show all possible days of year as options in addBox__inputDate
    const boxTimes = boxes.map(box => box.date.getTime());
    const possibleDates = getAllDatesOfWeekdayOfYear(
      weekday,
      Number(year)
    ).filter(date => !boxTimes.includes(date.getTime()));
    console.dir(possibleDates);
    //
  });
  $('addBox__inputDate').addEventListener(
    'change',
    _ => ($('addBox__saveButton').style.display = '')
  );
  $('addBox__saveButton').addEventListener('click', _ =>
    handler(boxes, new Date($('addBox__inputDate').value))
  );
};

const handleBoxAmount = handler => {
  $('boxAmount').addEventListener('change', e =>
    handler(commaToDot(e.target.value), $('variety').value)
  );
  $('boxAmount').setAttribute('autocomplete', 'off');
  $('boxAmount').addEventListener('click', e => e.target.select());
};

const handleSeedAmount = handler => {
  $('seedAmount').addEventListener('change', e =>
    handler(commaToDot(e.target.value), $('variety').value)
  );
  $('seedAmount').setAttribute('autocomplete', 'off');
  $('seedAmount').addEventListener('click', e => e.target.select());
};

const handleBedLength = handler => {
  $('bedLength').addEventListener('change', e =>
    handler(commaToDot(e.target.value), $('variety').value)
  );
  $('bedLength').setAttribute('autocomplete', 'off');
  $('bedLength').addEventListener('click', e => e.target.select());
};

const handleQuickpotAmount = handler => {
  $('quickpotAmount').addEventListener('change', e =>
    handler(commaToDot(e.target.value), $('variety').value)
  );
  $('quickpotAmount').setAttribute('autocomplete', 'off');
  $('quickpotAmount').addEventListener('click', e => e.target.select());
};

const handleCeilQuickpot = handler =>
  $('ceilQuickpot')?.addEventListener('click', _ =>
    handler($('quickpotAmount').value, $('variety').value)
  );

const handleFloorQuickpot = handler =>
  $('floorQuickpot')?.addEventListener('click', _ =>
    handler($('quickpotAmount').value, $('variety').value)
  );

const handleCulture = handler =>
  $('culture')?.addEventListener('change', e => handler(e.target.value));

const handleVariety = handler =>
  $('variety')?.addEventListener('change', e => handler(e.target.value));

const handleResetSowingForm = handler =>
  $('resetSowingForm').addEventListener('click', handler);

const hideMultiBoxForm = () => {
  $('planMultiBoxes__wrapper').style.display = 'none';
};

const hideAddBox = () => {
  $('addBox__wrapper').style.display = 'none';
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
  const emptySlots = filledSlots % size ? size - (filledSlots % size) : 0;
  const filledSlotHtml = '<div class="slot slot--filled"></div>';
  const emptySlotHtml = '<div class="slot slot--empty"></div>';
  const buttonsHtml = `<div>
      <button id="floorQuickpot">-<div class="mirror">&#x2935;</div></button>
      <button id="ceilQuickpot">+&#x2935;</button>
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
  if (data.veggie) {
    $('culture').style.display = 'none';
    $('variety').style.display = 'none';
    $('variety').value = data.veggie.id;
    $('veggieName').innerHTML = data.veggie.fullName;
    $('veggieName').style.display = '';
    $('boxAmount').value = dotToComma(
      Math.round(data.boxAmount * 1000) / 1000 || 0
    );
    $('seedAmount').value = data.seedAmount || 0;
    $('bedLength').value = dotToComma(data.bedLength || 0);
    $('quickpotAmount').value = dotToComma(data.quickpotAmount || 0);
    $('harvestUnit').innerHTML = data.veggie.harvestUnit;
    $('quickpotSize').innerHTML = `Größe ${data.veggie.quickpotSize}`;
    $('sowingInfos').style.display = '';
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
    $('quickpotImages').innerHTML = '';
    $('boxAmount').value = 0;
    $('seedAmount').value = 0;
    $('bedLength').value = 0;
    $('quickpotAmount').value = 0;
    $('sowingInfos').style.display = 'none';
    const options = [...data.cultures]
      .map(culture => `<option value="${culture}">${culture}</option>`)
      .join('');
    $('veggieName').style.display = 'none';
    $('variety').style.display = 'none';
    $('culture').innerHTML = `<option>Kultur auswählen</option>${options}`;
    $('culture').style.display = '';
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
    <div class="button">&#65291; Gemüse</div>
  </div>`;
      return boxHtml;
    })
    .join('');
  $('boxes__wrapper').innerHTML = boxesHtml;
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
  hideMultiBoxForm,
  hideAddBox,
  handleMultiBoxPreview,
  handleMultiBoxSave,
  handleAddBox,
  handleCulture,
  handleVariety,
  handleBoxAmount,
  handleSeedAmount,
  handleBedLength,
  handleQuickpotAmount,
  handleCeilQuickpot,
  handleFloorQuickpot,
  handleResetSowingForm,
  showEieruhr,
  init,
};
