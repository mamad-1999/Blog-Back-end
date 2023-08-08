import Validator from 'fastest-validator';
import { categories } from '../data/categories';

const v = new Validator();

const schema = {
  category: { type: 'string', enum: categories, optional: true },
};

const check = v.compile(schema);

export default check;
