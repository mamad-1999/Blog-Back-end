import Validator from 'fastest-validator';

const v = new Validator();

const schema = {
  username: { type: 'string', trim: true, min: 3, max: 50 },
  email: { type: 'email', normalize: true },
  profileUrl: { type: 'url' },
  $$strict: true,
};

const check = v.compile(schema);

export default check;
