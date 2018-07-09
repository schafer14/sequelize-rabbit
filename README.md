# Sequelize Rabbit

A simple sequelize plugin that sends pushes notifications to your amqp queue whenever 
is action on your database. 

## Usage

```javascript
const sequelizeRabbit = require('sequelize-rabbit')

const sequelize = new Sequelize(...)

sequelizeRabbit(sequelize, options)
```

Options 

`connection` specifying your rabbit mq connection string defaulting to 
process.env.AMQP_CREDENTIALS

`channel` specifies which exchange to push messages too defaults to 'main'

## Notes

The routing key will be `sequelize.resource_name.action.id` by default an empty
message will be sent. You can override this on your models by adding a rabbit
field to the sequelize constructor. Using the `sendData` field will send the 
objects dataValues. 

```javascript
const User = sequelize.define(...)

User.rabbit = {
  sendData: true,
  excludeFields: ['password', 'salt']
}
```
