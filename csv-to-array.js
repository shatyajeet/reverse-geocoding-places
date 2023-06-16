async function csvToArray(fileHandle) {
  const coordinates = [];
  for await (const line of fileHandle.readLines()) {
    if (coordinates.length === 0) {
      const headings = line.split(",");
      for (const _ of headings) {
        coordinates.push([]);
      }
    } else {
      const cells = line.split(",");
      for (let i = 0; i < cells.length; i++) {
        if (cells[i]) {
          coordinates[i].push(cells[i]);
        }
      }
    }
  }

  return coordinates;
}

function csvArrayToJSON(filteredCoords) {
  const userCoords = [];
  let i = 0;
  let userCount = 0;

  while (i < filteredCoords.length) {
    if (filteredCoords[i].length === 1) {
      userCoords.push({ user: filteredCoords[i][0], coordinates: [] });
      i++;
    } else {
      for (const [idx, entry] of filteredCoords[i].entries()) {
        userCoords[userCount].coordinates.push({
          lat: entry,
          lon: filteredCoords[i + 1][idx],
        });
      }
      i = i + 2;
      userCount++;
    }
  }

  return userCoords;
}

exports.csvToArray = csvToArray;
exports.csvArrayToJSON = csvArrayToJSON;
