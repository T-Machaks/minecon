import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_announcements', {
  defaults: () => ({ type: 'General', pinned: false }),
});
