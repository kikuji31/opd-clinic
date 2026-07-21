const app = require('./app');

// A stray error in a background task (e.g. the Drive upload after a patient
// is already registered) must not take down the server for every other
// patient using it — log and keep running instead of crashing the process.
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Patient intake form server running at http://localhost:${port}`);
});
