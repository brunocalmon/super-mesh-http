module.exports = class MalformedQueryError extends require('./AppError') {
    constructor (message, errorCode) {
      // Providing default message and overriding status code.
      super(message || 'MalformedQueryError', errorCode, 422);
    }
  };