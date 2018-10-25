process.env.NODE_ENV = 'test';
const User = require('../../models/user');
const db = require('../../db');

let job1, job2, company1, company2, user1, user2;
//Insert 2 users before each test
beforeEach(async function () {
  //adding companies and related users for those companies to test
  //build up our test tables
  await db.query(`
    CREATE TABLE companies
    (
      handle text PRIMARY KEY,
      name text NOT NULL UNIQUE,
      num_employees int,
      description text,
      logo_url text
    )
  `)
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
  `)
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
  `)

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
  company1 = result1.rows[0];
  company2 = result2.rows[0];
  job1 = result3.rows[0];
  job2 = result4.rows[0];
  user1 = result5.rows[0];
  user2 = result6.rows[0];
});

//Test get filtered users
describe('getUsers()', () => {
  it('should correctly return a list of users', async function () {
    const users = await User.getUsers({});
    expect(users.length).toEqual(2);
    expect(users[0]).toHaveProperty('username', user1.username);
    expect(users[0]).toHaveProperty('first_name', user1.first_name);
    expect(users[1]).toHaveProperty('username', user2.username);
    expect(users[1]).toHaveProperty('first_name', user2.first_name);
  });
});

//Test creating user
describe('createUser()', () => {
  it('should correctly add a user', async function () {
    const newUser = await User.createUser({
      username: 'bobcat',
      password: 'bob',
      first_name: 'bob',
      last_name: 'johnson',
      email: 'bob@gmail.com'
    });
    expect(newUser).toHaveProperty('is_admin', false);
    expect(newUser).toHaveProperty(
      'photo_url',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Default_profile_picture_%28male%29_on_Facebook.jpg/600px-Default_profile_picture_%28male%29_on_Facebook.jpg'
    );
    //Make sure password got hashed
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [newUser.username]
    );
    expect(result.rows[0].password === 'bob').toBe(false);
    const users = await User.getUsers();
    expect(users.length).toEqual(3);
  });
});

//Test get one user
describe('getUser()', () => {
  it('should correctly return a user by username', async function () {
    const user = await User.getUser(user1.username);
    expect(user.username).toEqual(user1.username);
    expect(user.email).toEqual(user1.email);

    //get a user that doesn't exist and check failure
    try {
      await User.getUser('nouser');
    } catch (e) {
      expect(e.message).toMatch(`Cannot find user by username: nouser`);
    }
  });
});

//Authenticate one user
describe('authenticate()', () => {
  it('should correctly return a json web token', async function () {
    const newUser = await User.createUser({
      username: 'bobcat',
      password: 'bob',
      first_name: 'bob',
      last_name: 'johnson',
      email: 'bob@gmail.com'
    });

    const token = await User.authenticate({ username: newUser.username, password: 'bob' });
    expect(token !== undefined).toEqual(true);
    expect(token === 'bob').toEqual(false);

    // try wrong password and catch error
    try {
      await User.authenticate(newUser.username, 'wrongpass');
    } catch (e) {
      expect(e.message).toMatch(`Invalid username/password`);
    }
  });
});

//Update a user test
describe('updateUser()', () => {
  it('should correctly update a user', async function () {
    let user = await User.getUser(user1.username);
    user.first_name = 'Josephina';

    await user.save();

    user = await User.getUser(user1.username);
    expect(user.first_name).toEqual('Josephina');

    const users = await User.getUsers({});
    expect(users.length).toEqual(2);

    expect(() => {
      user.username = 'JosephinaRocketina';
    }).toThrowError(`Can't change username!`);
  });
});

//Delete a user test
describe('deleteUser()', () => {
  it('should correctly delete a user', async function () {
    const user = await User.getUser(user1.username);
    const message = await user.deleteUser();
    expect(message).toBe('User Deleted');
  });
});

//Delete users and companies tables after each tets
afterEach(async function () {
  await db.query(`DROP TABLE jobs`);
  await db.query(`DROP TABLE users`);
  await db.query(`DROP TABLE companies`);
});

//Close db connection
afterAll(async function () {
  await db.end();
});
