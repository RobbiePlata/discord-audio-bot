import { SlashCommandBuilder } from '@discordjs/builders'
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice'
import { isValidYTUrl } from '../utils/index'
import ytdl from 'ytdl-core'
import { CacheType, CommandInteraction } from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from youtube')
    .addStringOption(option => option.setName('youtube').setDescription('The youtube link to play')),
  async execute(interaction: CommandInteraction<CacheType>) {
    const voice = interaction.guild.voiceStates.cache
    const voiceState = voice.get(interaction.user.id)
    const youtube = interaction.options.get('youtube')?.value

    if (!voiceState?.channelId) {
      await interaction.reply('You must be in a voice channel to use this command')
      return
    }

    if (!youtube) {
      await interaction.reply('You need to provide a youtube link')
      return
    }

    if (typeof youtube !== 'string' || !isValidYTUrl(youtube)) {
      await interaction.reply('The provided youtube link is invalid')
      return
    }

    const connection = joinVoiceChannel({
      channelId: voiceState.channelId,
      guildId: voiceState.guild.id,
      adapterCreator: voiceState.guild.voiceAdapterCreator,
    })

    const player = createAudioPlayer()
    connection.subscribe(player)

    const stream = ytdl(youtube, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 30,
      dlChunkSize: 0,
    }).on('error', err => {
      interaction.reply(`There was an error while playing this song: ${err.message}`)
      throw err
    })

    const resource = createAudioResource(stream)
    player.play(resource)
  },
}
