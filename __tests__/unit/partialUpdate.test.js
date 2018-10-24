process.env.NODE_ENV = 'test';
const { sqlForPartialUpdate } = require('../../helpers/partialUpdate');
const db = require('../../db');

//Insert company before each test
beforeEach(async function() {
  await db.query(`
  INSERT INTO companies (handle,name,num_employees,description,logo_url)
  VALUES ('AAPL','apple',123000,'Maker of hipster computers','http://www.apllogo.com')
  `);
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
  await db.query(`DELETE FROM companies`);
});

//Close db connection
afterAll(async function() {
  await db.end();
});
