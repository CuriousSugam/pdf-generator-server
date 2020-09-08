const dotenv = require('dotenv');
const app = require('./app');
const port = 3000;

dotenv.config();

app.listen(port);
console.log('Listening to port: ', port);
