import express from 'express';

export const startExpress = () => {
  const app = express();
  app.use(express.json());
  app.get('/ping', (_, res) => {
    console.log('ping-pong');
    res.json('pong');
  });
  app.listen(process.env.PORT || 5001);
};
