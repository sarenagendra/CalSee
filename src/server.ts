import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`CalSee backend is running on http://localhost:${config.port}`);
});
