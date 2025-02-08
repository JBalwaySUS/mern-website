const bcrypt = require('bcryptjs');

const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp.toString(), salt);
};

const verifyOTP = async (plainOTP, hashedOTP) => {
    return await bcrypt.compare(plainOTP.toString(), hashedOTP);
};

module.exports = {
    hashOTP,
    verifyOTP
};
