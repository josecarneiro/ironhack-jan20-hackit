'use strict';

module.exports = userShouldBeAuthenticated => (req, res, next) => {
  if (userShouldBeAuthenticated) {
    if (req.user) {
      next();
    } else {
      next(new Error('USER_NOT_AUTHENTICATED'));
    }
  } else {
    if (req.user) {
      next(new Error('VISITOR_EXPECTED'));
    } else {
      next();
    }
  }
};
