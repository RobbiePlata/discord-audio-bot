import { Client, Collection, Intents } from 'discord.js'
import { generateDependencyReport } from '@discordjs/voice'
import path from 'path'
import fs from 'fs'
import 'dotenv/config'

console.log('Starting...\n')
console.log(generateDependencyReport())

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS],
})

client.commands = new Collection()

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

console.log('Events\n')
for (const file of eventFiles) {
  console.log(`Loaded ${file}`)
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

console.log('Commands\n')
for (const file of commandFiles) {
  console.log(`Loaded ${file}`)
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return
  const command = client.commands.get(interaction.commandName)
  if (!command) return
  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

client.on('error', err => {
  console.log(err)
})

process.on('unhandledRejection', error => {
  console.log('error:', error)
})

client.login(process.env.DISCORD_TOKEN)
