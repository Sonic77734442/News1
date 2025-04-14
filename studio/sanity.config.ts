import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
// import { visionTool } from '@sanity/vision' // временно отключено
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'news1kz',

  projectId: 'your-project-id',
  dataset: 'production',

  plugins: [
    structureTool(),
    // visionTool(), // отключено для сборки
  ],

  schema: {
    types: schemaTypes,
  },
})
