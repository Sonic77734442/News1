export default {
  name: 'adBanner',
  title: 'Рекламный баннер',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Название баннера',
      type: 'string',
    },
    {
      name: 'type',
      title: 'Тип баннера',
      type: 'string',
      options: {
        list: ['image', 'html', 'adsense'],
        layout: 'radio',
      },
    },
    {
      name: 'image',
      title: 'Изображение',
      type: 'image',
      hidden: ({ parent }) => parent?.type !== 'image',
    },
    {
      name: 'link',
      title: 'Ссылка',
      type: 'url',
      hidden: ({ parent }) => parent?.type !== 'image',
    },
    {
      name: 'html',
      title: 'HTML/JS код (вставка баннера)',
      type: 'text',
      rows: 6,
      hidden: ({ parent }) => parent?.type === 'image',
    },
    {
      name: 'frequency',
      title: 'Частота показа (0–100, %)',
      type: 'number',
      validation: Rule => Rule.min(0).max(100),
      hidden: ({ parent }) => parent?.type === 'adsense',
    },
    {
      name: 'position',
      title: 'Позиция на сайте',
      type: 'string',
      options: {
        list: ['sidebar', 'hero', 'under-article'],
      },
    },
    {
      name: 'enabled',
      title: 'Активен',
      type: 'boolean',
      initialValue: true,
    },
  ],
}