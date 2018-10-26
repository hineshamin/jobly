db = require('../db');

async function createTables() {
  await db.query(`
  CREATE TABLE companies
  (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees int,
    description text,
    logo_url text
  )
  `);
  await db.query(`      
  CREATE TABLE jobs
  (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL CHECK(equity BETWEEN 0 and 1),
    company_handle text REFERENCES companies ON DELETE cascade,
    date_posted TIMESTAMP default CURRENT_TIMESTAMP
  )
  `);
  await db.query(`
  CREATE TABLE users
  (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Default_profile_picture_%28male%29_on_Facebook.jpg/600px-Default_profile_picture_%28male%29_on_Facebook.jpg',
    is_admin boolean NOT NULL default false
  )
  `);
  await db.query(`
  CREATE TABLE applications
  (
    username text REFERENCES users ON DELETE CASCADE,
    job_id int REFERENCES jobs ON DELETE CASCADE,
    state text NOT NULL,
    created_at timestamp default CURRENT_TIMESTAMP,
    PRIMARY KEY(username,job_id)
  )
  `);
}

async function insertTestData() {
  let result1 = await db.query(`
  INSERT INTO companies (handle,name,num_employees,description,logo_url)
  VALUES ('AAPL','apple',123000,'Maker of hipster computers','http://www.apllogo.com')
  RETURNING handle,name,num_employees,description,logo_url
  `);
  let result2 = await db.query(`
  INSERT INTO companies (handle,name,num_employees,description,logo_url)
  VALUES ('GOOG','google',70000,'Search engine giant','http://www.google.com')
  RETURNING handle,name,num_employees,description,logo_url
  `);
  let result3 = await db.query(`
  INSERT INTO jobs (title,salary,equity,company_handle)
  VALUES ('CEO',1123000,0.7,'AAPL')
  RETURNING id, title,salary,equity,company_handle, date_posted
  `);
  let result4 = await db.query(`
  INSERT INTO jobs (title,salary,equity,company_handle)
  VALUES ('JANITOR',80000,0.9,'GOOG')
  RETURNING id,title,salary,equity,company_handle,date_posted
  `);
  let result5 = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('joerocket', 'testpass', 'joe', 'smith', 'joe@gmail.com', True)
  RETURNING username, first_name, last_name, email, photo_url, is_admin`);
  let result6 = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('spongebob', 'garry', 'SpongeBob', 'SquarePants', 'sponge@gmail.com', False)
  RETURNING username, first_name, last_name, email, photo_url, is_admin`);

  const company1 = result1.rows[0];
  const company2 = result2.rows[0];
  const job1 = result3.rows[0];
  const job2 = result4.rows[0];
  const user1 = result5.rows[0];
  const user2 = result6.rows[0];

  let result7 = await db.query(
    `
  INSERT INTO applications (username, job_id, state)
  VALUES ($1,$2,'rejected')
  RETURNING username, job_id, state, created_at
  `,
    [user1.username, job1.id]
  );
  let result8 = await db.query(
    `
  INSERT INTO applications (username, job_id, state)
  VALUES ($1,$2,'accepted')
  RETURNING username, job_id, state, created_at
  `,
    [user2.username, job2.id]
  );

  const application1 = result7.rows[0];
  const application2 = result8.rows[0];

  return {
    company1,
    company2,
    job1,
    job2,
    user1,
    user2,
    application1,
    application2
  };
}

async function dropTables() {
  await db.query(`DROP TABLE applications`);
  await db.query(`DROP TABLE jobs`);
  await db.query(`DROP TABLE users`);
  await db.query(`DROP TABLE companies`);
}

module.exports = {
  createTables,
  insertTestData,
  dropTables
};
