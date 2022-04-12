export default Object.freeze({
  printBoxes: data =>
    console.log(
      data.boxes.map(
        box =>
          `${box.datum}: ${Object.entries(box.ingredients).reduce(
            (prev, curr) =>
              prev + `${curr[1]} ${data.veggies[curr[0]].fullName}; `,
            ''
          )}`
      )
    ),
});
