export default {
  title: 'Контент',
  name: 'blockContent',
  type: 'array',
  of: [
    {
      type: 'block',
    },
    {
      type: 'image',
      options: { hotspot: true },
    },
    {
      type: 'object',
      name: 'youtube',
      title: 'YouTube',
      fields: [
        {
          name: 'url',
          title: 'URL',
          type: 'url',
        },
        {
          name: 'title',
          title: 'Заголовок',
          type: 'string',
        },
      ],
    },
  ],
};
