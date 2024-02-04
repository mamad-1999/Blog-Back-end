import Validator from 'fastest-validator';

const v = new Validator();

const schema = {
  currentPassword: { type: 'string', trim: true, min: 8, max: 255 },
  newPassword: { type: 'string', trim: true, min: 8, max: 255 },
  confirmNewPassword: { type: 'string', trim: true, min: 8, max: 255 },
  $$strict: true,
};

const check = v.compile(schema);

export default check;
