import { browser } from '$app/environment';

const dummy: any = new Proxy({}, {
  get(_, prop) {
    if (prop === 'TriggerProps' || prop === 'ContentProps' || prop === 'RootProps') return {};
    return function () { return null; };
  }
});

let VaulModule: any = dummy;

if (browser) {
  import('vaul-svelte').then(m => {
    VaulModule = m.Drawer;
  });
}

export const DrawerPrimitive = new Proxy({}, {
  get(_, prop) {
    if (browser && VaulModule !== dummy) {
      return VaulModule[prop];
    }
    return dummy[prop];
  }
});
