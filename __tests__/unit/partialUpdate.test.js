process.env.NODE_ENV = 'test';
const { sqlForPartialUpdate } = require('../../helpers/partialUpdate');
const db = require('../../db');
const {
  createTables,
  insertTestData,
  dropTables
} = require('../../test_helpers/setup');

let job1, job2, company1, company2, user1, user2;
//Insert 2 users before each test
beforeEach(async function() {
  //adding companies and related users for those companies to test
  //build up our test tables
  await createTables();
  ({ company1, company2, job1, job2, user1, user2 } = await insertTestData());
});

//Test partial update function
describe('partialUpdate()', () => {
  it('should generate a proper partial update query with just 1 field', async function() {
    const { query, values } = sqlForPartialUpdate(
      'companies',
      { num_employees: 100000 },
      'handle',
      'AAPL'
    );
    const result = await db.query(query, values);
    expect(result.rows[0].num_employees).toBe(100000);
  });
});

//Delete company after each tets
afterEach(async function() {
  await dropTables();
});

//Close db connection
afterAll(async function() {
  await db.end();
});
