const { Routes } = require('discord-api-types/v9')
const { REST } = require('@discordjs/rest')
require('dotenv').config()

var argv = require('minimist')(process.argv.slice(2));

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)

if (argv.all) {
    rest.get(Routes.applicationCommands(process.env.CLIENT_ID))
        .then(data => {
            const promises = [];
            for (const command of data) {
                console.log(command)
                const deleteUrl = `${Routes.applicationCommands(process.env.CLIENT_ID)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
}

if (argv.command) {
    rest.get(Routes.applicationCommands(process.env.CLIENT_ID))
        .then(data => {
            const promises = [];
            for (const command of data) {
                if (command.name === argv.command) {
                    console.log(command)
                    const deleteUrl = `${Routes.applicationCommands(process.env.CLIENT_ID)}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
            }
            return Promise.all(promises);
        });
}