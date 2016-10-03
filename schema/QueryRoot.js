import path from 'path'
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql'

const dataFilePath = path.join(__dirname, '../data', process.env.NODE_ENV === 'test' ? 'test-data.sl3' : 'demo-data.sl3')
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dataFilePath
  },
  useNullAsDefault: true
})

import joinMonster from 'join-monster'
import User from './User'

export default new GraphQLObjectType({
  description: 'global query object',
  name: 'Query',
  fields: () => ({
    version: {
      type: GraphQLString,
      resolve: () => joinMonster.version
    },
    users: {
      type: new GraphQLList(User),
      resolve: (parent, args, context, ast) => {
        return joinMonster(ast, context, sql => {
          // place the SQL query in the response headers. ONLY for debugging. Don't do this in production
          if (context) {
            context.set('X-SQL-Preview', sql.replace(/\n/g, '%0A'))
          }
          return knex.raw(sql)
        })
      }
    },
    user: {
      type: User,
      args: {
        id: {
          description: 'The users ID number',
          type: GraphQLInt
        }
      },
      where: (usersTable, args, context) => { // eslint-disable-line no-unused-vars
        if (args.id) return `${usersTable}.id = ${args.id}`
      },
      resolve: (parent, args, context, ast) => {
        return joinMonster(ast, context, sql => {
          if (context) {
            context.set('X-SQL-Preview', sql.replace(/\n/g, '%0A'))
          }
          return knex.raw(sql)
        })
      }
    }
  })
})
