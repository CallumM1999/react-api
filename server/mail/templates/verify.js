module.exports = (email) => ({
    from: '"Callum" <callum.macpherson.apps@gmail.com',
    to: email,
    subject: 'Verify Email Address',
    text: 'Welcome to the Notes App! Before you can use the app, you must confirm your email address! <a href="http://localhost:8080/verify?code=hrh73hr73bf73b2bfbf8wfbdf8dfbbuh8sdfs8f">Verify</a>'    
});