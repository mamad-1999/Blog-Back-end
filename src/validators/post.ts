import Validator from 'fastest-validator';

const v = new Validator();

const schema = {
  title: { type: 'string', max: 40, min: 3 },
  description: { type: 'string', min: 10 },
  image: { type: 'string', min: 10 },
  $$strict: true,
};

const check = v.compile(schema);

export default check;
