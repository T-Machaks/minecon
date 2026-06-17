import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_sponsors', {
  defaults: () => ({ tier: 'Bronze', featured: false }),
});
