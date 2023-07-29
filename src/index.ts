import app from './app';
import mongoose from 'mongoose';

const port = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
  console.log('CONNECTED TO MONGODB!')

  app.listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.log(err)
});
