const Cryptr = require("cryptr");
const cryptr = new Cryptr(
  "fkjawfhjdhfjkhfhrifruhuihiwuhfuiwhfiurhfufkljef3jfqeif"
);

function encrypt(msg) {
  const encryptedString = cryptr.encrypt(msg);
  return encryptedString;
}

function decrypt(encryptedString) {
  const decryptedString = cryptr.decrypt(encryptedString);
  return decryptedString;
}

module.exports = { encrypt, decrypt };
