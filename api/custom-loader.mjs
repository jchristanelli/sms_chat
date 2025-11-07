// import { resolve } from 'node:module';

// // custom-loader.mjs

// export async function resolve(specifier, context, defaultResolve) {
//   console.log(`Resolving async: ${specifier}, from: ${context.parentURL}`);
//   return defaultResolve(specifier, context, defaultResolve);
// }

// export function resolveSync(specifier, context, defaultResolveSync) {
//   console.log(`Resolving sync: ${specifier}, from: ${context.parentURL}`);
//   return defaultResolveSync(specifier, context, defaultResolveSync);
// }

// export async function load(url, context, defaultLoad) {
//   console.log(`Loading async: ${url}`);
//   return defaultLoad(url, context, defaultLoad);
// }

// export function loadSync(url, context, defaultLoadSync) {
//   console.log(`Loading sync: ${url}`);
//   return defaultLoadSync(url, context, defaultLoadSync);
// }
