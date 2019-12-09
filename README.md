# @jmshal/cloudflare-workers-router

A Cloudflare Workers router, based on [`find-my-way`](https://github.com/delvedor/find-my-way).

Until there's a proper readme, here's a little example of how to use this package.

```ts
import { Router } from '@jmshal/cloudflare-workers-router';

const router = new Router();

// GET /
router.get('/', async (request: Request) => {
  return new Response('Hello World');
});

// GET /
// accept-version: 2.x
router.get('/', { version: '2.0.0' }, async (request: Request) => {
  return new Response('Hello World v2');
});

// GET /hello/world
router.get('/hello/:message', async (request: Request, { message }) => {
  return new Response(`Hello, ${message}!`);
});

// POST /submit
// ...
// {"message":"world"}
router.post('/submit', async (request: Request) => {
  const body = await request.json();
  return new Response(`Hello, ${body.message}!`);
});

router.listen();
```
