import path from 'path'
import koa from 'koa'
import koaRouter from 'koa-router'
import graphqlHTTP from 'koa-graphql'
// module we created that lets you serve a custom build of GraphiQL
import graphiql from 'koa-custom-graphiql'
import koaStatic from 'koa-static'

import schema from './schema/index'

const app = koa()
const router = koaRouter()

router.get('/graphql', graphiql({
  css: '/graphiql.css',
  js: '/graphiql.js'
}))

router.post('/graphql', graphqlHTTP({
  schema,
  formatError: e => {
    console.error(e)
    return e
  }
}))

app.use(router.routes())
// serve the custom build of GraphiQL
app.use(koaStatic(path.join(__dirname, 'node_modules/graphsiql')))

app.listen(3000, () => console.log('server listening at http://localhost:3000/graphql'))
