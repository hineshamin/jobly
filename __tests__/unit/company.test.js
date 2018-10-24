process.env.NODE_ENV = 'test';
const Company = require('../../models/company');
const db = require('../../db');

let company1;
let company2;
//Insert 2 companies before each test
beforeEach(async function() {
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
  company1 = result1.rows[0];
  company2 = result2.rows[0];
});

//Test get filtered companies
describe('getFilteredCompanies()', () => {
  it('should correctly return a filtered list of companies', async function() {
    const companies = await Company.getFilteredCompanies({});
    expect(companies.length).toEqual(2);
    expect(companies[0]).toHaveProperty('handle', company1.handle);
    expect(companies[1]).toHaveProperty('logo_url', company2.logo_url);
    const filteredCompaniesMin = await Company.getFilteredCompanies({
      min: 71000
    });
    expect(filteredCompaniesMin.length).toEqual(1);
    const filteredCompaniesMax = await Company.getFilteredCompanies({
      max: 120000
    });
    expect(filteredCompaniesMax.length).toEqual(1);
    const filteredCompaniesSearch = await Company.getFilteredCompanies({
      search: 'ogl'
    });
    expect(filteredCompaniesSearch.length).toEqual(1);
  });
});

//Test creating company
describe('createCompany()', () => {
  it('should correctly add a company', async function() {
    const newCompany = await Company.createCompany({
      handle: 'NFLX',
      name: 'Netflix',
      num_employees: 5000,
      description: 'American media services provider',
      logo_url: 'http://netflix.com'
    });
    expect(newCompany.handle).toEqual('NFLX');
    const companies = await Company.getFilteredCompanies({});
    expect(companies.length).toEqual(3);
  });
});

//Delete companies after each tets
afterEach(async function() {
  await db.query(`DELETE FROM companies`);
});

//Close db connection
afterAll(async function() {
  await db.end();
});
