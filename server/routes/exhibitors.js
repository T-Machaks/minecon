import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_exhibitors', {
  defaults: () => ({ featured: false }),
});
