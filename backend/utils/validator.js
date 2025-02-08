const validator = require('validator');

const validateEmail = (email) => {
    return validator.isEmail(email) && 
           validator.matches(email, /^[a-zA-Z0-9._%+-]+@iiit\.ac\.in$/);
};

const validatePhoneNumber = (phone) => {
    return validator.isMobilePhone(phone, 'any');
};

module.exports = {
    validateEmail,
    validatePhoneNumber
};