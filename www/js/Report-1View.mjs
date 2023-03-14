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

  const sum = {
    quickpots: {
      15: 0,
      77: 0,
      84: 0,
      144: 0,
      all: 0,
    },
    bedLength: 0,
  };

  const rows = workSteps.reduce((rows, workStep) => {
    sum.quickpots[15] += workStep.quickpots[15] || 0;
    sum.quickpots[77] += workStep.quickpots[77] || 0;
    sum.quickpots[84] += workStep.quickpots[84] || 0;
    sum.quickpots[144] += workStep.quickpots[144] || 0;
    sum.quickpots.all += workStep.quickpots[15] || 0;
    sum.quickpots.all += workStep.quickpots[77] || 0;
    sum.quickpots.all += workStep.quickpots[84] || 0;
    sum.quickpots.all += workStep.quickpots[144] || 0;
    sum.bedLength += workStep.bedLength;
    sum.bedLength = Math.round(sum.bedLength * 100) / 100;
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
      <td>${sum.quickpots[15]}</td>
      <td>${sum.quickpots[77]}</td>
      <td>${sum.quickpots[84]}</td>
      <td>${sum.quickpots[144]}</td>
      <td>${sum.quickpots.all}</td>
      <td>${sum.bedLength}</td>
      </tr>`;
    return rows + row;
  }, '');

  $('report-1__table').querySelector('tbody:first-of-type').innerHTML = rows;
};

export {renderWorkSteps};
