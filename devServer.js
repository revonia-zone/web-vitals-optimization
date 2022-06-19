const Koa = require('koa')
const app = new Koa()
const serve = require('koa-static')
const mount = require('koa-mount')
const path = require('path')

app.use(mount('/web-vitals-optimization', serve(path.join(__dirname, 'docs'))))

app.listen(3000, () => {
  console.log('http://localhost:3000/web-vitals-optimization/')
})
