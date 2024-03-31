const { addYears, format } = require("date-fns");
const Account = require("../models/account");

const generateCreditCardNumber = async () => {
  const cardLength = 16;
  const cardPrefixes = ["4", "51", "52", "53", "54", "55"];
  let cardNumber = "";

  while (true) {
    const randomPrefix =
      cardPrefixes[Math.floor(Math.random() * cardPrefixes.length)];
    cardNumber = randomPrefix;

    for (let i = 0; i < cardLength - randomPrefix.length - 1; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }

    if (isValidLuhn(cardNumber)) {
      const existingCard = await Account.findOne({ cardNumber });
      if (!existingCard) {
        break;
      } else {
        cardNumber = "";
      }
    } else {
      cardNumber = "";
    }
  }

  return cardNumber;
};

const isValidLuhn = (number) => {
  let sum = 0;
  let isSecondDigit = false;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);

    if (isSecondDigit) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isSecondDigit = !isSecondDigit;
  }

  return sum % 10 === 0;
};

const generateExpirationDate = () => {
  const currentDate = new Date();
  const expirationDate = addYears(currentDate, 30);
  return format(expirationDate, "MM/yy");
};

const generateCVV = () => {
  return Math.floor(100 + Math.random() * 900);
};

module.exports = {
  generateCreditCardNumber,
  generateExpirationDate,
  generateCVV,
};
