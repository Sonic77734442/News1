export default {
  name: 'adBanner',
  title: 'Баннер',
  type: 'object',
  fields: [
    {
      name: 'type',
      title: 'Тип баннера',
      type: 'string',
      options: {
        list: [
          { title: 'Изображение', value: 'image' },
          { title: 'HTML-код', value: 'html' }
        ],
        layout: 'radio',
        direction: 'horizontal'
      }
    },
    {
      name: 'image',
      title: 'Изображение',
      type: 'image',
      hidden: ({ parent }: { parent: any }) => parent?.type === 'html',
    },
    {
      name: 'html',
      title: 'HTML-код',
      type: 'text',
      rows: 6,
      hidden: ({ parent }: { parent: any }) => parent?.type === 'image',
    },
    {
      name: 'link',
      title: 'Ссылка при клике',
      type: 'url',
    }
  ],
  preview: {
    select: {
      type: 'type',
      image: 'image',
      html: 'html'
    },
    prepare(selection: any) {
      const { type, image, html } = selection
      return {
        title: `Баннер (${type === 'image' ? 'Изображение' : 'HTML'})`,
        subtitle: type === 'image' ? image?.asset?._ref : html?.slice(0, 30) + '...'
      }
    }
  }
}
