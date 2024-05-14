function isEmailValid(email) {
  const emailRegex =
  /^(([^<>()[\]\\.,:@"]+(\.[^<>()[\]\\.,:@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
}

function isMobileValid(mobile) {
  let mobileRegex = /^\d{10}$/; 
  return mobileRegex.test(mobile);
  }

module.exports = {
  isEmailValid,
  isMobileValid,
};
