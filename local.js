const app = require('./index');
const port = 3000;

// Server
app.listen(port, () => {
   console.log(`Listening on: http://localhost:${port}`);
});
