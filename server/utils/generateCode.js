const characterRange = 'abcdefghijklmnopqrstuvwxyz0123456789';


const generateCode = length => {

    let code = '';

    for (let i=0;i<length;i++) {
        const index = Math.floor(Math.random() * characterRange.length);
        code += characterRange[index];
    }

    return code;
}

module.exports = generateCode;