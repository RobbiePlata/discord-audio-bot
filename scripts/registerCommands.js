const path = require('path')
const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
require('dotenv').config()

const commandsPath = path.join(__dirname, '..',  'dist/commands')
console.log(commandsPath)
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

const commands = []

console.log('Started refreshing application (/) commands.')
for (const file of commandFiles) {
  console.log(`Registered ${file}`)
  const command = require(path.join(commandsPath, file))
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  })
  .then(() => {
    console.log('Successfully reloaded application (/) commands.')
  })
  .catch(error => {
    console.error(error)
  })
