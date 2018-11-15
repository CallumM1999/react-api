module.exports = (email, code) => ({
    from: '"Callum" <callum.macpherson.apps@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: 'confirmation code: ' + code     
});