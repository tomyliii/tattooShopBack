const base64 = require("crypto-js/enc-base64");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

module.exports = convertToBase64;
