'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const amqpLib = require('amqplib')

function main (sequelize, options) {
  options = options || {}

  amqpLib.connect(options.connection || process.env['AMQP_CREDENTIALS'])
    .then((conn) => {
      return conn.createChannel()
    })
    . tap((ch) => {
      return ch.assertExchange(options.channel || 'main', 'topic')
    }).then((ch) => {
      sequelize.addHook('afterCreate', queue('create', ch, options))
      sequelize.addHook('afterDestroy', queue('destroy', ch, options))
      sequelize.addHook('afterUpdate', queue('update', ch, options))
      sequelize.addHook('afterSave', queue('save', ch, options))
      sequelize.addHook('afterUpsert', queue('upsert', ch, options))
    })
}

function queue (action, channel, sequelizeOptions) {
  return function (object, options) {
    let rawObject = object.dataValues
    let passedOn = ''

    if (object.constructor.rabbit && object.constructor.rabbit.sendData) {
      let excludes = object.constructor.rabbit.excludeFields || []

      _.forEach(excludes, (excludeField) => {
        delete rawObject[excludeField]
      })

      passedOn = JSON.stringify(rawObject)
    }

    let name = `${_.kebabCase(object.constructor.name)}`
    channel.publish('main', `sequelize.${name}.${action}.${object.id}`, Buffer.from(passedOn))
  }
}

module.exports = main
