import monaco from 'non-exists';
export default {
  foo() {
    return monaco.Promise.wrap(import('./tsMode.js'));
  },
}
