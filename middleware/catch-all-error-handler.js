'use strict';

const errorCodeMap = {
  PASSWORD_INSECURE:
    'The password you have inserted is not secure. Please, include a password that is at least 8 characters long.',
  NOT_FOUND: 'The page was not found.'
};

module.exports = (error, req, res, next) => {
  // Set error information, with stack only available in development
  const data = {};
  const errorCodeMessage = errorCodeMap[error.message];
  if (errorCodeMessage) {
    data.message = errorCodeMessage;
  } else {
    data.message = 'There was an unknown error.';
  }
  // if (error.message) data.message = error.message;
  if (process.env.NODE_ENV === 'development') data.error = error;
  res.status(error.status || 500).render('error', data);
};
