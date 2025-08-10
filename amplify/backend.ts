import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';

const backend = defineBackend({
  auth,
  data,
});

const httpDataSource = backend.data.addHttpDataSource(
  "HttpDataSource",
  "https://www.example.com"
);
