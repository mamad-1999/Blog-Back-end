import Validator from 'fastest-validator';

const v = new Validator();

const schema = {
  commentText: { type: 'string' },
};

const check = v.compile(schema);

export default check;
