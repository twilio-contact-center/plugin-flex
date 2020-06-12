const fs = require('fs');
const path = require('path');

/**
 * Checks files exist
 * @param files the path to files to check
 * @returns {boolean}
 */
const filesExist = (...files) => files.map(fs.existsSync).every((resp) => resp);

/**
 * Reads and parses a JSON file
 * @param paths
 * @returns {any}
 */
const readJSONFile = (...paths) => JSON.parse(fs.readFileSync(path.join(...paths), 'UTF'));

module.exports = {
  filesExist,
  readJSONFile,
};
