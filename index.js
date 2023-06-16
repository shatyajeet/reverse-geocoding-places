const fs = require("node:fs/promises");
const axios = require("axios");
const { csvToArray, csvArrayToJSON } = require("./csv-to-array");

// Promisified setTimeout for adding delay in API requests
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function reverseGeocodeCoordinates() {
  try {
    // Convert the csv to array of arrays
    const file = await fs.open("./Data_Coordinates.xlsx - Sheet1.csv", "r");
    const coordinates = await csvToArray(file);

    // Convert the array of arrays to array of JSON data
    const filteredCoords = coordinates.filter((arr) => arr.length > 0);
    const userCoords = csvArrayToJSON(filteredCoords);

    // Geoapify is a third party API that allows for reverse-geocoding and location type identification
    // Reverse geocoding API returns the best possible "place" for the coordinates.
    // The places API returns the "category" for each place that we want to check for.
    // Since the free account has a rate limit of 3 requests for second, there is a sleep of 400ms added between requests
    for (const user of userCoords) {
      console.log(user.user);
      for (const coords of user.coordinates.slice(0, 10)) {
        const reversePlace = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${coords.lat}&lon=${coords.lon}&apiKey=bbe828509f5a4860ab50e3123a9cae44`
        );
        const props = reversePlace.data.features[0].properties;

        await sleep(400);

        const placeDetails = await axios.get(
          `https://api.geoapify.com/v2/place-details?id=${props.place_id}&apiKey=bbe828509f5a4860ab50e3123a9cae44`
        );
        const placeProps = placeDetails.data.features[0]?.properties;
        console.log(
          `Location info for ${coords.lat}, ${coords.lon}:`,
          placeProps?.categories || "No location info found"
        );

        await sleep(400);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

reverseGeocodeCoordinates()
  .then(() => {})
  .catch(() => {});
