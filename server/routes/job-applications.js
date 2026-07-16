import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_job_applications', {
  gsiFields: { job_id: 'job_id-index' },
  defaults: () => ({ created_date: new Date().toISOString() }),
});
