import { kubescapePlugin } from './plugin';

describe('kubescape', () => {
  it('should export plugin', () => {
    expect(kubescapePlugin).toBeDefined();
  });
});
