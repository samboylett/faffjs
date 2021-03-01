[![npm version](https://badge.fury.io/js/faffjs.svg)](https://badge.fury.io/js/faffjs)
[![Netlify Status](https://api.netlify.com/api/v1/badges/90492cd0-e52f-441e-a033-98a5eff7ab52/deploy-status)](https://app.netlify.com/sites/faffjs/deploys)

# FaffJS

**F**rontend **A**pi **Ff**ramework is a library for cleaning up API calls in
JavaScript frontend apps.

## Installation

```sh
yarn add faffjs
# or
npm install --save faffjs
```

## Usage

### Setup

```javascript
import FaffJS from 'faffjs';

const faff = new FaffJS();

export default faff; // Access your faff instance from anywhere in your app
```

### Adding Actions

Actions each represent a call to your API. They split the call into the request,
error handling and success handling, although error and success handling are
optional.

#### Add a basic action

Requests are passed 2 arguments, the first is the context (more on this later)
and the second is passed through from the dispatch call.

```javascript
faff.add('signup', {
    async request({ request }, { email, password }) {
        await request('/api/signup', {
            method: 'post',
            data: {
                email,
                password,
            },
        });
    },
});
```

#### Add success and error handling

Success and error functions are both passed the context parameter. The `success`
function is also passed the valid response. The `error` functon is passed the
error object thrown by the request. Note that even though the `error` function
returns a value, this will be thrown by the dispatch function (the promise
will reject).

```javascript
faff.add('signup', {
    async request({ request }, { email, password }) {
        await request('/api/signup', {
            method: 'post',
            data: {
                email,
                password,
            },
        });
    },

    success(context, response) {
        return response.data.message;
    }

    error(context, error) {
        return error.response.data.errors;
    }
});
```

#### Using a controller

For more complex requests, you may prefer using a controller. A controller will
be instantiated for each request, allowing you to store state across the
function calls.

Controller example:
```javascript
import { FaffRequestController } from 'faffjs';

export default class YourController extends FaffRequestController {
    async request(context, params) {
        // your code
    },

    success(context, response) {
        // your code
    }

    error(context, error) {
        // your code
    }

    // other functions you need
}
```

And in your faff file:
```javascript
import YourController from './YourController.js';

faff.add('your-request', YourController);
```

#### Context

All action methods are called with a context. This is an instance of
`FaffContext` which will be shared across the method calls. It provides access
to `faff` methods and the raw response or error depending on the request:

```javascript
FaffContext {
    request // function
    dispatch // function
    params // any, params supplied to dispatch
    faff // the faff instance
    response? // response if the request was a success
    error? // error if the request errored
}
```

#### Performing requests

Faff provides a `request` function in the context. Using this will keep track of
the loading state, which can by accessed with `faff.loading`. The `request`
function is otherwise a proxy to the `requestAdapter` function. By defaut, this
is also just a proxy to `fetch`, but this can be overridden to change the
request library you wish to use. E.g.:

```javascript
import FaffJS from 'faffjs';
import axios from 'axios';

const faff = new FaffJS();

faff.requestAdapter = (...args) => axios(...args);

export default faff;
```

### Dispatching requests from your app

Faff provides a `dispatch` function for dispatching API requests. This method
takes 2 parameters, the action name and the parameters which are passed directly
to the request.

```javascript
import faff from './path/to/your/faff/instance';

await faff.dispatch('your-request', { your: 'data' });
```

This method always returns a promise. This promise will either resolve to the
success value, or reject to the error value.

### Events

Faff provides an events API to watch the instance. These can be accessed via
`faff.events` which follows the NodeJS event emitter API.

#### Dispatch events

- beforeRequest
- afterRequest
- beforeSuccess
- afterSuccess
- beforeError
- afterError

Called before or after each method in an action. Is passed an object consisting
of the action key, params and context.

#### Loading events

- loadingUpdate

Called with the current number of loading requests. Can be used to update your
apps loading state.

## Full API Docs

[Full API spec can be seen here](https://faffjs.netlify.app)

# Modules

## Vuex Store

You can install FaffJS directly into your Vuex Store as a namespaced module. To
do this you should instead import `FaffVuex` which implements a `toModule`
method.

In your faff file:
```javascript
import { FaffVuex } from 'faffjs';

const faff = new FaffVuex();

// add actions

export default faff;
```

In your store file:
```javascript
import Vuex from 'vuex';
import faff from './path/to/your/faff';

export default new Vuex.Store({
    modules: {
        faff: faff.toModule(),
    },
});
```

You can then use the actions directly from Vuex:
```javascript
this.$store.dispatch('faff/foo', /* your params */);
```

Actions called via Vuex will have a `store` included in the `context`, which is
the Vuex action context.
