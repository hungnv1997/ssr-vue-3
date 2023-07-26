<script lang="ts">
import { computed, defineComponent, reactive } from 'vue'
import { useHead } from '@vueuse/head'
import { useStore } from '../store'

export default defineComponent({
  name: 'Home',
  setup() {
    const store = useStore()

    useHead({
      title: 'Home',
      // title: 'Trang chủ', // Tiêu đề trang
      // description: 'Mô tả trang web', // Mô tả trang
      // keywords: 'từ khóa, seo, vue', // Từ khóa liên quan đến trang
      // author: 'Tên tác giả', // Tên tác giả của trang
      // ogTitle: 'Tiêu đề Open Graph', // Tiêu đề cho Open Graph
      // ogDescription: 'Mô tả Open Graph', // Mô tả cho Open Graph
      // ogType: 'website', // Loại trang web cho Open Graph
      // ogImage: '/path/to/image.png', // Ảnh cho Open Graph
      // ogUrl: 'https://example.com/trang-chu', // URL của trang web cho Open Graph
      // twitterCard: 'summary', // Loại thẻ Twitter Card
      // twitterSite: '@tai-khoan-twitter', // Tên tài khoản Twitter của trang
      // twitterCreator: '@tai-khoan-tac-gia-twitter', // Tên tài khoản Twitter của tác giả
      // canonical: 'https://example.com/trang-chu', // URL trang chủ cơ bản
      // favicon: '/path/to/favicon.png', // Đường dẫn favicon của trang
      bodyAttrs: {
        class: 'head',
      },
      meta: [
        {
          name: 'description',
          content: 'Mô tả trang web',
        },
        {
          name: 'keywords',
          content: 'từ khóa, seo, vue',
        },
        {
          name: 'author',
          content: 'Tên tác giả',
        },
        {
          property: 'og:title',
          content: 'Tiêu đề Open Graph',
        },
        {
          property: 'og:description',
          content: 'Mô tả Open Graph',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:image',
          content: '/path/to/image.png',
        },
        {
          property: 'og:url',
          content: 'https://example.com/trang-chu',
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:site',
          content: '@tai-khoan-twitter',
        },
        {
          name: 'twitter:creator',
          content: '@tai-khoan-tac-gia-twitter',
        },
        {
          rel: 'canonical',
          href: 'https://example.com/trang-chu',
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/path/to/favicon.png',
        },
      ],
    })

    const state = reactive({
      count: 0,
    })

    const toAbout = store.fetchHome

    return {
      state,
      toAbout,
    }
  },
})
</script>

<template>
  <h1 :class="$style.title">Home</h1>
  <button @click="state.count++">count is: {{ state.count }}</button>
  <button @click="toAbout">Redirect to '/about' url from Pinia</button>
</template>

<style module lang="scss">
.title {
  color: green;
}
</style>
