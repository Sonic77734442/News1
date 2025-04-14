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
      name: 'publishedAt',
      title: 'Дата публикации',
      type: 'datetime',
    },
    {
      name: 'mainImage',
      title: 'Изображение',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'description',
      title: 'Краткое описание',
      type: 'text',
    },
    {
      name: 'category',
      title: 'Категория',
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        disableNew: false,
      },
    },
    {
      name: 'body',
      title: 'Текст поста',
      type: 'blockContent',
    },
    {
      name: 'featured',
      title: 'Топ новость (Hero)',
      type: 'boolean',
      description: 'Показать в Hero-блоке на главной',
    },
  ],
};
