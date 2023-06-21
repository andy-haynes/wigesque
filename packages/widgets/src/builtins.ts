export function defineBuiltinComponents() {
  return function (h: (el: string, props: any, placeholder: string) => {}) {
    return {
      Checkbox(props: any) {
        return h('span', props, 'loading Checkbox...');
      },
      CommitButton(props: any) {
        return h('span', props, 'loading CommitButton...');
      },

      Fragment(props: any) {
        return h('span', props, 'loading Fragment...');
      },

      IpfsImageUpload(props: any) {
        return h('span', props, 'loading IpfsImageUpload...');
      },

      Dialog(props: any) {
        return h('span', props, 'loading Dialog...');
      },

      DropdownMenu(props: any) {
        return h('span', props, 'loading Dialog...');
      },

      Files(props: any) {
        return h('span', props, 'loading Files...');
      },

      InfiniteScroll(props: any) {
        return h('span', props, 'loading InfiniteScroll...');
      },

      Markdown(props: any) {
        return h('span', props, 'loading Markdown...');
      },

      OverlayTrigger(props: any) {
        return h('span', props, 'loading OverlayTrigger...');
      },

      Tooltip(props: any) {
        return h('span', props, 'loading Tooltip...');
      },

      Typeahead(props: any) {
        return h('span', props, 'loading Typeahead...');
      },

      Widget({ src, props }: { src: string, props: any }) {
        return h('div', props, 'loading ' + src + '...');
      },
    }
  }
}
