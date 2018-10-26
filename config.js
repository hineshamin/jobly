/** Shared config for application; can be req'd many places. */

require('dotenv').config();

const DEFAULT_PHOTO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Default_profile_picture_%28male%29_on_Facebook.jpg/600px-Default_profile_picture_%28male%29_on_Facebook.jpg';
const SECRET = process.env.SECRET_KEY || 'test';
const BCRYPT_WORK_FACTOR = process.env.BCRYPT_WORK_FACTOR || 10;

const PORT = +process.env.PORT || 3000;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'jobly-test'
// - else: 'jobly'

let DB_URI;

if (process.env.NODE_ENV === 'test') {
  DB_URI = 'jobly-test';
} else if (process.env.NODE_ENV === 'fake') {
  DB_URI = 'fake-db';
} else {
  DB_URI = process.env.DATABASE_URL || 'jobly';
}

module.exports = {
  SECRET,
  PORT,
  DB_URI,
  BCRYPT_WORK_FACTOR,
  DEFAULT_PHOTO
};
