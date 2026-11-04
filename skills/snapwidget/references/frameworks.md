# SnapWidget code in a JavaScript framework

The HTML code from `snapwidget embed <widget_id> --format html` has two parts:

- one or more `<script src="https://snapwidget.com/js/...">` tags (a popup or banner widget has a small inline script that loads one), and sometimes a `<link rel="stylesheet">`;
- the widget itself: an `<iframe class="snapwidget-widget">`, or a `<div>` for a popup or banner widget.

A framework that renders the page with JavaScript does not run a `<script>` tag inside a component. Load each script once per page as shown here, and render the iframe or div as it is.

## React

`snapwidget embed <widget_id> --format react` gives a component that loads the scripts in `useEffect`. Save it and render it.

## Next.js

`snapwidget embed <widget_id> --format next` gives a component that loads the scripts with `next/script`. It works in the App Router and the Pages Router.

## Vue

Vue templates drop `<script>` tags. Put the iframe in the template and load each script once, in `onMounted`:

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const src = 'https://snapwidget.com/js/snapwidget.js' // each src from the HTML code
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement('script')
    script.src = src
    document.body.appendChild(script)
  }
})
</script>

<template>
  <!-- the iframe from the HTML code -->
</template>
```

Or add the `<script>` tags to `index.html` and keep only the iframe in the component.

## Nuxt

Load the scripts with `useHead` and put the iframe in the template:

```vue
<script setup>
useHead({ script: [{ src: 'https://snapwidget.com/js/snapwidget.js' }] })
</script>
```

## Svelte and SvelteKit

Put the scripts in `<svelte:head>` and the iframe in the markup:

```svelte
<svelte:head>
  <script src="https://snapwidget.com/js/snapwidget.js"></script>
</svelte:head>

<!-- the iframe from the HTML code -->
```

## Astro

Astro bundles `<script>` tags unless they have `is:inline`. Add `is:inline` to each script tag of the HTML code:

```astro
<script is:inline src="https://snapwidget.com/js/snapwidget.js"></script>
<!-- the iframe from the HTML code -->
```

## Popup and banner widgets

A popup or banner widget starts once, when the page loads. In a React, Next.js, Vue, Nuxt, Svelte or Astro site, put its code in the root layout (in Next.js, `app/layout.tsx`), so it starts when the site loads, as on any other site. In a page component, it does not start again when the visitor leaves the page and comes back.

## Size

On a responsive widget, `snapwidget.js` sets the iframe's height to fit its posts. Keep the iframe's `style` and `class` as they are. To make the widget narrower, put it in a container with a `max-width`.
