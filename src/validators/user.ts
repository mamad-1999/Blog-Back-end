import Validator from 'fastest-validator';

const v = new Validator();

const schema = {
  name: { type: 'string', min: 2, max: 30, trim: true, optional: true },
  image: { type: 'string', trim: true, optional: true },
  phone: { type: 'string', trim: true, optional: true, min: 10 },
  biography: { type: 'string', optional: true, max: 255 },
  birthdayDate: { type: 'string', optional: true },
  gender: { type: 'string', value: ['male', 'female', 'other'], optional: true },
  twitterProfile: { type: 'string', optional: true },
  linkedinProfile: { type: 'string', optional: true },
};

const check = v.compile(schema);

export default check;
