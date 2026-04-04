const { createApp } = require('./app');
const { PORT } = require('./constants');

const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
