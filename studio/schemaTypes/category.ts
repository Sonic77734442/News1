export default {
  name: 'category',
  title: 'Категория',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Название категории',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
  ],
};
