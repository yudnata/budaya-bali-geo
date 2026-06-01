const success = (message, data = null) => {
  return {
    success: true,
    message,
    data,
  };
};

const error = (message) => {
  return {
    success: false,
    message,
  };
};

module.exports = {
  success,
  error,
};
