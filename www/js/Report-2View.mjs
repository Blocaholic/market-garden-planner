const $ = id => document.getElementById(id);

const render = seedRequirement => {
  const rows = seedRequirement
    .sort((a, b) => {
      const cultureA = a.culture.toLowerCase();
      const cultureB = b.culture.toLowerCase();
      return cultureA < cultureB ? -1 : cultureA > cultureB ? 1 : 0;
    })
    .reduce(
      (rows, seed) =>
        rows +
        `<tr><td>${seed.culture}</td><td>${seed.variety}</td><td>${seed.seedAmount}</td></tr>`,
      ''
    );
  $('report-2__table').querySelector('tbody:first-of-type').innerHTML = rows;
};

export {render};
