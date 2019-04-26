module.exports = class NoEligibleNodesError extends require('./AppError') {
    constructor (message, errorCode) {
      // Providing default message and overriding status code.
      super(message || 'NoEligibleNodesError', errorCode, 500);
    }
  };