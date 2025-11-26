const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, '../src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        if (process.env.GUILD_ID) {
            const guildIds = process.env.GUILD_ID.split(',');
            let totalDeployed = 0;

            for (const guildId of guildIds) {
                const trimmedId = guildId.trim();
                if (!trimmedId) continue;

                console.log(`Deploying to Guild: ${trimmedId}`);
                const guildData = await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, trimmedId),
                    { body: commands },
                );
                totalDeployed += guildData.length;
            }
            console.log(`Successfully reloaded ${totalDeployed} application (/) commands across specified guilds.`);
        } else {
            console.log('Deploying Global Commands (might take 1 hour to update)');
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);
        }
    } catch (error) {
        console.error(error);
    }
})();
