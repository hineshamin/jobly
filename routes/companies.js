const express = require('express');
const router = new express.Router();
const Company = require('../models/company');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const validateInput = require('../middleware/validation');
const newCompanySchema = require('../schema/newCompany.json');
const updateCompanySchema = require('../schema/updateCompany.json');

//Get a filtered list of companies
router.get('/', async function(req, res, next) {
  try {
    const companiesResults = await Company.getFilteredCompanies(req.query);
    const companies = companiesResults.map(company => ({
      name: company.name,
      handle: company.handle
    }));
    return res.json({ companies });
  } catch (error) {
    return next(error);
  }
});

//Create a new company
router.post('/', validateInput(newCompanySchema), async function(
  req,
  res,
  next
) {
  try {
    const company = await Company.createCompany(req.body);
    return res.json({ company });
  } catch (error) {
    return next(error);
  }
});

//Get a company by handle
router.get('/:handle', async function(req, res, next) {
  try {
    const company = await Company.getCompany(req.params.handle);
    return res.json({ company });
  } catch (error) {
    return next(error);
  }
});

//Update a company
router.patch('/:handle', validateInput(updateCompanySchema), async function(
  req,
  res,
  next
) {
  try {
    const companyToUpdate = await Company.getCompany(req.params.handle);
    classPartialUpdate(companyToUpdate, req.body);
    const updatedCompany = await companyToUpdate.updateCompany();
    return res.json({ company: updatedCompany });
  } catch (error) {
    return next(error);
  }
});

//Delete a company
router.delete('/:handle', async function(req, res, next) {
  try {
    const companyToDelete = await Company.getCompany(req.params.handle);
    const message = await companyToDelete.deleteCompany();
    return res.json({ message });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
