const bcrypt = require('bcryptjs');
const saltRounds = 10;
const myPlaintextPassword = 'user1password';
const someOtherPlaintextPassword = 'not_bacon';
const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync(myPlaintextPassword, salt);

const result1 = bcrypt.compareSync(myPlaintextPassword, hash); // true
const result2 = bcrypt.compareSync(myPlaintextPassword, "$2a$10$EPnthcumX7nuadzr9saCt.lGr1HuyOrn3KoEuue5ZYPQ87HEcrQD."); // true
console.log(myPlaintextPassword, hash);
console.log(result1,result2);



