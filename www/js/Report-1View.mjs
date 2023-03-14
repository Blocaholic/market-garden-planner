import {dateToString} from './Utils.mjs';
const $ = id => document.getElementById(id);
const $$ = query => document.querySelectorAll(query);

const renderWorkSteps = workSteps => {
  const translateWorkStep = workStep => {
    if (workStep.workStep === 'sowInQuickpot') return 'Säen in Quickpot';
    if (workStep.workStep === 'sowInBed') return 'Säen in Beet';
    if (workStep.workStep === 'plantInBed') return 'Auspflanzen';
    if (workStep.workStep === 'clearBed') return 'Beet roden';
    return '';
  };
  const rows = workSteps
    .map(workStep => {
      const row = `<tr>
      <td>${dateToString(workStep.date)}</td>
      <td>${translateWorkStep(workStep)}</td>
      <td>${workStep.veggie.id} ${workStep.veggie.fullName}</td>
      <td>${workStep.amount}</td>
      <td>${workStep.quickpots[15] || ''}</td>
      <td>${workStep.quickpots[77] || ''}</td>
      <td>${workStep.quickpots[84] || ''}</td>
      <td>${workStep.quickpots[144] || ''}</td>
      <td>${workStep.bedLength}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      </tr>`;
      return row;
    })
    .join('');
  $('report-1__table').querySelector('tbody:first-of-type').innerHTML = rows;
};

export {renderWorkSteps};
