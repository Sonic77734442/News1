export default {
  name: 'post',
  title: 'Пост',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Заголовок',
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
    {
      name: 'author',
      title: 'Автор',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Категория',
      type: 'reference',
      to: [{ type: 'category' }],
    },
    {
      name: 'publishedAt',
      title: 'Дата публикации',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'shortDescription',
      title: 'Краткое описание',
      type: 'string',
    },
    {
      name: 'mainImage',
      title: 'Главное изображение',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'featured',
      title: 'Отображать как топ новость',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'body',
      title: 'Текст статьи',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
};
