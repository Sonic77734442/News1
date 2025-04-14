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
  ],
};
