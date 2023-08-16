import Validator from 'fastest-validator';

const v = new Validator();

const schema = {
  title: { type: 'string', max: 40, min: 3, optional: true },
  description: { type: 'string', min: 10, optional: true },
  image: { type: 'string', optional: true },
  $$strict: true,
};

const check = v.compile(schema);

export default check;
