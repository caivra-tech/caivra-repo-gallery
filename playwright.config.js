import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./test',testMatch:'**/*.spec.js',workers:1,retries:0,use:{baseURL:'http://127.0.0.1:4173',browserName:'chromium',acceptDownloads:true},webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:15000},reporter:'list'});
