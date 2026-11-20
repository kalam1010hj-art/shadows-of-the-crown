import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./e2e',timeout:120000,
  use:{baseURL:'http://127.0.0.1:4173',viewport:{width:800,height:480},
    launchOptions:{args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']}},
  webServer:{command:'npm run preview -- --host 127.0.0.1',url:'http://127.0.0.1:4173'}
});
