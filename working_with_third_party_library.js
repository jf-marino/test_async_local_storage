const als = require('async-local-storage');
als.enable();


const knex = require('knex')({
  client: 'pg',
  connection: {
      host: '127.0.0.1',
      user: 'admin',
      password: 'secret',
      database: 'hiq_crm'
  }
});

const SQL_BINDING_REGEX = /(\?|\$[0-9]+)/g;
const logQuery = (_, obj) => {
  const email = als.get('user');

  // Replace the `?` characters in the SQL query
  // with their corresponding binding.
  let index = 0;
  const replace = () => obj.bindings[index++];
  const query = obj.sql.replace(SQL_BINDING_REGEX, replace).trim();
  
  console.log(`\n`);
  console.log(`/* Query executed by: ${email || 'unknown'} */`);
  console.log(query);
  console.log(`\n`);
};

knex.on('query-response', logQuery);

const getLeads = () => {
  return knex('lead').select('lead.*');
};


const express = require('express');
const app = express();
const port = 3000;

const userMiddleware = (_, __, next) => {
  als.scope();
  als.set('user', 'foo@gmail.com');
  next();
}

app.use(express.json());
app.use(userMiddleware);

app.get('/', async (_, res) => {
  res.send({ leads: await getLeads() });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
