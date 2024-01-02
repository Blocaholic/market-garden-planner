const $ = id => document.getElementById(id);

const render = seedRequirement => {
  const rows = seedRequirement.reduce(
    (rows, seed) =>
      rows +
      `<tr><td>${seed.culture}</td><td>${seed.variety}</td><td>${seed.seedAmount}</td></tr>`,
    ''
  );
  $('report-2__table').querySelector('tbody:first-of-type').innerHTML = rows;
};

export {render};
