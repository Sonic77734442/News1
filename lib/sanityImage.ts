import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const config = {
  projectId: '8kp3qa75',
  dataset: 'production',
  apiVersion: '2023-03-01',
  useCdn: true,
}

const client = createClient(config)
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
