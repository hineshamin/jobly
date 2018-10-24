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