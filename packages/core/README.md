# Forms.js

## Project Structure

<pre>
  ├──  package.json
  │
  ├──  src
  │   ├──  constants.ts
  │   │
  │   ├──  form-control  --> core form logic is implemented by a framework-agnostic control
  │   │   │
  │   │   └──  types  --> types for class methods, i.e. their props and returned values
  │   │
  │   ├──  global.d.ts  --> interface overrides
  │   │
  │   ├──  logic  --> helpers for implementing the form logic
  │   │   │
  │   │   ├──  errors  --> error related logic
  │   │   │
  │   │   ├──  fields  --> field related logic
  │   │   │
  │   │   ├──  html  --> DOM related logic
  │   │   │
  │   │   └──  validation  --> validation related logic
  │   │       │
  │   │       └──  native-validation  --> native validation protocol
  │   │
  │   ├──  store.ts  --> port of Svelte store's for managing state
  │   │
  │   ├──  types  --> core form types; completely independent from everything else
  │   │
  │   └──  utils  --> utilities
  │       │
  │       └──  types  --> type helpers, e.g. object parsers
  │
  └──  tsconfig.json
</pre>
