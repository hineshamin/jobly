CREATE TABLE companies
(
  handle text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  num_employees int,
  description text,
  logo_url text
);

CREATE TABLE jobs
(
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  salary float NOT NULL,
  equity float NOT NULL CHECK(equity BETWEEN 0 and 1),
  company_handle text REFERENCES companies ON DELETE cascade,
  date_posted TIMESTAMP default CURRENT_TIMESTAMP
);

CREATE TABLE users
(
  username text PRIMARY KEY,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  photo_url text
    DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Default_profile_picture_%28male%29_on_Facebook.jpg/600px-Default_profile_picture_%28male%29_on_Facebook.jpg',
  is_admin boolean NOT NULL default false
);

CREATE TABLE applications
(
  username text REFERENCES users ON DELETE CASCADE,
  job_id int REFERENCES jobs ON DELETE CASCADE,
  state text NOT NULL,
  created_at timestamp default CURRENT_TIMESTAMP,
  PRIMARY KEY(username,job_id)
);