// require('./src/server/polyfills')
if (!globalThis.fetch) {
  globalThis.fetch = require('isomorphic-fetch')
}
const redisClient = require('./redis.js')
const fs = require('fs')
const path = require('path')
const express = require('express')

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

const resolve = (p: string) => path.resolve(__dirname, p)

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production'
) {
  async function cacheMiddleware(req, res, next) {
    const cacheKey = req.url

    try {
      const cachedHtml = await redisClient.get(cacheKey)
      if (cachedHtml) {
        // Serve cached HTML if available
        res.send(cachedHtml)
      } else {
        // If not cached, proceed to render the page and store in Redis
        res.originalSend = res.send
        res.send = async (html) => {
          await redisClient.set(cacheKey, html, 'EX', 60) // Cache for 60 seconds (adjust as needed)
          res.originalSend(html)
        }

        next()
      }
    } catch (error) {
      console.error('Redis Error:', error)
      next()
    }
  }
  const indexProd = isProd
    ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
    : ''

  const manifest = isProd
    ? // @ts-ignore
      require('./dist/client/ssr-manifest.json')
    : {}

  const app = express()
  app.use(cacheMiddleware)
  app.use('/robots.txt', function (req, res, next) {
    res.type('text/plain')
    res.send('User-agent: *\nAllow: /$\nAllow: /pages/\nDisallow: /')
  })
  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite
  if (!isProd) {
    vite = await require('vite').createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: 'ssr',
        watch: {
          usePolling: true,
          interval: 100,
        },
      },
    })

    app.use(vite.middlewares)
  } else {
    app.use(require('compression')())
    app.use(
      require('serve-static')(resolve('dist/client'), {
        index: false,
      })
    )
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template, render
      if (!isProd) {
        template = fs.readFileSync(resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.ts')).render
      } else {
        template = indexProd
        // @ts-ignore
        render = require('./dist/server/entry-server.js').render
      }

      const {
        html: appHtml,
        preloadLinks,
        headTags,
        htmlAttrs,
        bodyAttrs,
        initialState,
      } = await render({
        url,
        req,
        res,
        manifest,
      })

      const html = template
        .replace('<!--head-tags-->', headTags)
        .replace(' ${htmlAttrs}', htmlAttrs)
        .replace(' ${bodyAttrs}', bodyAttrs)
        .replace('<!--preload-links-->', preloadLinks)
        .replace('<!--app-html-->', appHtml)
        .replace('window.__pinia = {};', `window.__pinia = ${initialState};`)

      res.set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e: any) {
      if (e._isMtfRedirect) {
        res.status(e.status)
        res.redirect(e.redirectTo)

        return
      }

      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log('http://localhost:3000')
    })
  )
}

exports.createServer = createServer
