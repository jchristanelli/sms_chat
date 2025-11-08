// Tells TypeScript that any import ending in .vue is a Vue component type
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>

  export default component
}

/// <reference types="vite/client" />

// Fixes CSS files loading
declare module '*.css'
declare module '*.scss'
declare module '*.sass'
declare module '*.less'
declare module '*.styl'

// Fixes 'vuetify/styles' not being recognized
declare module 'vuetify/styles'
