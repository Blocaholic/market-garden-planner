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

  const max = {
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

    max.quickpots[15] =
      max.quickpots[15] > sum.quickpots[15]
        ? max.quickpots[15]
        : sum.quickpots[15];
    max.quickpots[77] =
      max.quickpots[77] > sum.quickpots[77]
        ? max.quickpots[77]
        : sum.quickpots[77];
    max.quickpots[84] =
      max.quickpots[84] > sum.quickpots[84]
        ? max.quickpots[84]
        : sum.quickpots[84];
    max.quickpots[144] =
      max.quickpots[144] > sum.quickpots[144]
        ? max.quickpots[144]
        : sum.quickpots[144];
    max.quickpots.all =
      max.quickpots.all > sum.quickpots.all
        ? max.quickpots.all
        : sum.quickpots.all;
    max.bedLength =
      max.bedLength > sum.bedLength ? max.bedLength : sum.bedLength;

    const row = `<tr>
      <td>${workStep.dayte.de}</td>
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

  const tableFoot = document.createElement('tfoot');
  tableFoot.innerHTML = `<tfoot><tr>
  <th></th>
  <th></th>
  <th></th>
  <th></th>
  <th></th>
  <th></th>
  <th></th>
  <th></th>
  <th>max.</th>
  <th>${max.quickpots[15]}</th>
  <th>${max.quickpots[77]}</th>
  <th>${max.quickpots[84]}</th>
  <th>${max.quickpots[144]}</th>
  <th>${max.quickpots.all}</th>
  <th>${max.bedLength}</th>
  </tr></tfoot>`;

  $('report-1__table').querySelector('tbody:first-of-type').innerHTML = rows;
  $('report-1__table').appendChild(tableFoot);
};

export {renderWorkSteps};
