const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const validateInput = require('../middleware/validation');

//Get a filtered list of jobs
router.get('/', async function (req, res, next) {
  try {
    const jobsResults = await Job.getFilteredJobs(req.query);
    const jobs = jobsResults.map(job => ({
      title: job.title,
      company_handle: job.company_handle
    }));
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

//Create a new job
router.post('/', async function (
  req,
  res,
  next
) {
  try {
    const job = await Job.createJob(req.body);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

//Get a job by id
router.get('/:id', async function (req, res, next) {
  try {
    const job = await Job.getJob(req.params.id);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

// //Update a job
// router.patch('/:id', validateInput(updateCompanySchema), async function (
//   req,
//   res,
//   next
// ) {
//   try {
//     const companyToUpdate = await Job.getJob(req.params.id);
//     classPartialUpdate(companyToUpdate, req.body);
//     const updatedCompany = await companyToUpdate.updateCompany();
//     return res.json({ job: updatedCompany });
//   } catch (error) {
//     return next(error);
//   }
// });

// //Delete a job
// router.delete('/:id', async function (req, res, next) {
//   try {
//     const companyToDelete = await Job.getJob(req.params.id);
//     const message = await companyToDelete.deleteCompany();
//     return res.json({ message });
//   } catch (error) {
//     return next(error);
//   }
// });

module.exports = router;
