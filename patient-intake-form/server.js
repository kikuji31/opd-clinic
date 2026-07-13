const app = require('./app');

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Patient intake form server running at http://localhost:${port}`);
});
