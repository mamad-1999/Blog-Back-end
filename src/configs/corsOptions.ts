import allowOrigins from './allowOrigins';

import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  origin: (origin: string, callback: (err: Error | null, isOk?: true) => never) => {
    if (allowOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not Allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
