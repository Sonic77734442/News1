export default {
  name: 'adBanner',
  title: 'Баннер',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Название',
      type: 'string',
    },
    {
      name: 'type',
      title: 'Тип баннера',
      type: 'string',
      options: {
        list: [
          { title: 'Изображение', value: 'image' },
          { title: 'HTML-код', value: 'html' },
          { title: 'AdSense', value: 'adsense' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    },
    {
      name: 'image',
      title: 'Изображение',
      type: 'image',
      hidden: ({ parent }: { parent: any }) => parent?.type !== 'image',
    },
    {
      name: 'html',
      title: 'HTML-код',
      type: 'text',
      rows: 6,
      hidden: ({ parent }: { parent: any }) => parent?.type !== 'html',
    },
    {
      name: 'link',
      title: 'Ссылка при клике',
      type: 'url',
    },
    {
      name: 'position',
      title: 'Позиция',
      type: 'string',
      options: {
        list: [{ title: 'Сайдбар', value: 'sidebar' }],
        layout: 'radio',
        direction: 'horizontal',
      },
    },
    {
      name: 'enabled',
      title: 'Включен',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'frequency',
      title: 'Частота показа (%)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0).max(100),
    },
  ],
  preview: {
    select: {
      type: 'type',
      title: 'title',
      image: 'image',
      html: 'html',
    },
    prepare(selection: any) {
      const { type, image, html, title } = selection;
      return {
        title:
          title ||
          `Баннер (${
            type === 'image' ? 'Изображение' : type === 'adsense' ? 'AdSense' : 'HTML'
          })`,
        subtitle: type === 'image' ? image?.asset?._ref : html?.slice(0, 30) + '...',
      };
    },
  },
};
