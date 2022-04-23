#!/usr/bin/env node
'use strict';
import Utils from './Utils.mjs';
import Data from './Data.mjs';

const plant = (veggies, boxes, numberOfBoxes) => {
  const plantSets = [];
  boxes.forEach(box => {
    Object.entries(box.ingredients).forEach(([kind, amountPerBox]) => {
      let planned = false;
      const veggie = veggies[kind];
      const bedDuration = veggie['Kulturdauer am Beet'];
      const quickpotDuration = veggie.Anzuchtzeit;
      const seedAmount = Math.ceil(
        (amountPerBox * numberOfBoxes) /
          veggie['Erntemenge pro Ernte'] /
          veggie.Feldquote /
          veggie.Anzuchtquote
      );
      plantSets
        .filter(plantSet => plantSet.kind === kind)
        .forEach(plantSet => {
          if (planned) return;
          if (veggie.isSingleCrop) {
            const minDate = new Date(plantSet.sowingDate.getTime());
            minDate.setDate(
              plantSet.sowingDate.getDate() + bedDuration + quickpotDuration
            );
            const maxDate = new Date(minDate.getTime());
            maxDate.setDate(minDate.getDate() + veggie['Erntezeittoleranz']);
            const minTime = minDate.getTime();
            const maxTime = maxDate.getTime();
            const cropTime = box.datum.getTime();
            if (cropTime >= minTime && cropTime <= maxTime) {
              plantSet.seedAmount += seedAmount;
              plantSet.crops.push([box.datum, amountPerBox * numberOfBoxes]);
              planned = true;
            }
            return;
          }
          if (veggie['Erntehäufigkeit pro Pflanze'] > plantSet.crops.length) {
            const getPossibleCropTimes = (plantSet, veggie) => {
              let tempDate = new Date(plantSet.sowingDate.getTime());
              tempDate.setDate(
                tempDate.getDate() +
                  veggie.Anzuchtzeit +
                  veggie['Kulturdauer am Beet']
              );
              let possibleCropTimes = [tempDate.getTime()];
              const plannedCropTimes = plantSet.crops.map(crop =>
                crop[0].getTime()
              );
              for (let i = 1; i < veggie['Erntehäufigkeit pro Pflanze']; i++) {
                tempDate.setDate(tempDate.getDate() + veggie.Ernteintervall);
                if (!plannedCropTimes.includes(tempDate.getTime()))
                  possibleCropTimes.push(tempDate.getTime());
              }
              return possibleCropTimes;
            };
            const cropTime = box.datum.getTime();
            const possibleCropTimes = getPossibleCropTimes(plantSet, veggie);
            if (!possibleCropTimes.includes(cropTime)) {
              const cropDate = new Date(cropTime);
              const possibleCropDates = possibleCropTimes
                .map(x => new Date(x))
                .map(x => Utils.dateToString(x));
              return;
            }
            const grownCrop =
              plantSet.seedAmount *
              veggie.Anzuchtquote *
              veggie.Feldquote *
              veggie['Erntemenge pro Ernte'];
            const neededCrop = amountPerBox * numberOfBoxes;
            if (grownCrop >= neededCrop) {
              plantSet.crops.push([box.datum, amountPerBox * numberOfBoxes]);
              planned = true;
              return;
            } else {
              console.error(
                `Benötigte Erntemenge (${neededCrop}) ist größer als von bestehendem Satz zu ernten (${grownCrop}). Neuer Satz ${veggies[kind].fullName} wird geplant!`
              );
            }
          }
        });

      const sowingDate = new Date(box.datum.getTime());
      sowingDate.setDate(box.datum.getDate() - bedDuration - quickpotDuration);

      if (!planned)
        plantSets.push({
          kind,
          sowingDate,
          seedAmount,
          crops: [[box.datum, amountPerBox * numberOfBoxes]],
        });
    });
  });
  return plantSets;
};

const veggiesPromise = Data.getVeggies();
const boxesPromise = Data.getBoxes();

Promise.all([veggiesPromise, boxesPromise]).then(([veggies, boxes]) => {
  const plants = plant(veggies, boxes, 174);
  plants.forEach(plant => {
    console.log(
      `Aussaat: ${plant.seedAmount} ${
        veggies[plant.kind].fullName
      } am ${Utils.dateToString(plant.sowingDate)} mit folgenden Ernten:`
    );
    plant.crops.forEach(crop =>
      console.log(
        `${Utils.dateToString(crop[0])}: ${Math.round(crop[1] * 100) / 100}`
      )
    );
  });

  console.log(`Aussaaten gesamt: ${plants.length}`);

  const head = `Aussaat Datum;Aussaat Menge;Sorte;Quickpot Menge;Quickpot Größe;Start Datum Beet;Länge Beet(m);letzte Ernte;`;
  const csv = plants.reduce((csv, plant) => {
    const quickpotSize = veggies[plant.kind].Vorziehen
      ? veggies[plant.kind].Quickpot
      : '';
    const quickpotAmount = Utils.dotToComma(
      veggies[plant.kind].Vorziehen
        ? Math.round((plant.seedAmount / quickpotSize) * 100) / 100
        : ''
    );
    const bedStartDate = veggies[plant.kind].Vorziehen
      ? Utils.dateToString(
          Utils.addDaysToDate(plant.sowingDate, veggies[plant.kind].Anzuchtzeit)
        )
      : Utils.dateToString(plant.sowingDate);
    const bedAmount = veggies[plant.kind].Vorziehen
      ? plant.seedAmount * veggies[plant.kind].Anzuchtquote
      : plant.seedAmount;
    const bedLength = Utils.dotToComma(
      Math.round(
        (bedAmount /
          ((100 / veggies[plant.kind].Pflanzabstand) *
            Math.floor(75 / veggies[plant.kind].Reihenabstand))) *
          100
      ) / 100
    );
    const finalCropDate = Utils.dateToString(
      plant.crops.reduce(
        (prev, curr) => (curr[0].getTime() > prev.getTime() ? curr[0] : prev),
        new Date(0)
      )
    );
    const row = `${Utils.dateToString(plant.sowingDate)};${plant.seedAmount};${
      veggies[plant.kind].fullName
    };${quickpotAmount};${quickpotSize};${bedStartDate};${bedLength};${finalCropDate}`;
    return `${csv}\n${row}`;
  }, head);

  Utils.writeFile('./data/output/plantSets.csv', csv);
});
