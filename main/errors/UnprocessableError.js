module.exports = class UnprocessableError extends require('./AppError') {
    constructor (message, errorCode) {
      // Providing default message and overriding status code.
      super(message || 'Unprocessable Entity', errorCode, 422);
    }
  };