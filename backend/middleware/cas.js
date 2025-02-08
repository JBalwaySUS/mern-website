const CASAuthentication = require('cas-authentication');

const cas = new CASAuthentication({
    cas_url: 'https://login.iiit.ac.in/cas',
    service_url: 'http://localhost:5000',
    cas_version: '2.0',
    renew: false,
    session_name: 'cas_user',
    session_info: 'cas_userinfo',
    destroy_session: true
});

module.exports = cas;