const fs = require("fs");
const cities = require("../data/cities_raw.json").data;

const result = {};

for (const city of cities) {
  result[city.locode] = city.cityId;
}

const jsonData = JSON.stringify(result);
fs.writeFile("data/cities.json", jsonData, "utf8", (err) => {
  if (err) {
    console.error("Error writing to file", err);
  } else {
    console.log("Data writting to cities.json");
  }
});
