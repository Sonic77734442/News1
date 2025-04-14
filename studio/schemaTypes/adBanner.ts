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
<<<<<<< HEAD
      hidden: ({ parent }) => parent?.type !== 'image',
=======
      hidden: ({ parent }: { parent: any }) => parent?.type !== 'image',
>>>>>>> 319e0e7 (Initial commit)
    },
    {
      name: 'link',
      title: 'Ссылка',
      type: 'url',
<<<<<<< HEAD
      hidden: ({ parent }) => parent?.type !== 'image',
=======
      hidden: ({ parent }: { parent: any }) => parent?.type !== 'image',
>>>>>>> 319e0e7 (Initial commit)
    },
    {
      name: 'html',
      title: 'HTML/JS код (вставка баннера)',
      type: 'text',
      rows: 6,
<<<<<<< HEAD
      hidden: ({ parent }) => parent?.type === 'image',
=======
      hidden: ({ parent }: { parent: any }) => parent?.type === 'image',
>>>>>>> 319e0e7 (Initial commit)
    },
    {
      name: 'frequency',
      title: 'Частота показа (0–100, %)',
      type: 'number',
<<<<<<< HEAD
      validation: Rule => Rule.min(0).max(100),
      hidden: ({ parent }) => parent?.type === 'adsense',
=======
      validation: (Rule: any) => Rule.min(0).max(100),
      hidden: ({ parent }: { parent: any }) => parent?.type === 'adsense',
>>>>>>> 319e0e7 (Initial commit)
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