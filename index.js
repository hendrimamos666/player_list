
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const servers = require('./servers.json');

process.on('unhandledRejection', err => {
  console.error(err);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('messageCreate', async (msg) => {
  if (msg.content === '!helpfinder') {
    const embed = new EmbedBuilder()
      .setTitle('🔎 FiveM Player Finder Bot')
      .setDescription('Cari player di berbagai server FiveM dengan cepat dan mudah.')
      .addFields(
        { name: '⚡ Fast Player Search', value: 'Cari nama player secara cepat' },
        { name: '🌐 Multi Server Finder', value: 'Scan banyak server sekaligus' },
        { name: '🟢 Online 24/7', value: 'Bot selalu aktif' },
        { name: '📌 Bantuan', value: '`!helpfinder`' }
      )
      .setColor(0x00ffcc);

    msg.reply({ embeds: [embed] });
  }

  if (msg.content.startsWith('!cari')) {
    const keyword = msg.content.split(' ')[1]?.toLowerCase();
    if (!keyword) return msg.reply('Masukkan nama player!');

    let foundPlayers = [];

    for (const server of servers) {
      try {
        const res = await fetch(`http://${server.ip}/players.json`);
        const data = await res.json();

        data.forEach(p => {
          if (p.name.toLowerCase().includes(keyword)) {
            foundPlayers.push({
              name: p.name,
              id: p.id,
              ping: p.ping,
              server: server.name
            });
          }
        });

      } catch (err) {
        console.log(`Server ${server.name} error`);
      }
    }

    if (foundPlayers.length === 0) {
      return msg.reply('❌ Player tidak ditemukan');
    }

    const embed = new EmbedBuilder()
      .setTitle('🎯 Target Berhasil Dilacak!')
      .setColor(0xff0000);

    foundPlayers.forEach(p => {
      embed.addFields({
        name: `👤 ${p.name}`,
        value: `🆔 ID: ${p.id}\n📶 Ping: ${p.ping}ms\n🌐 Server: ${p.server}`
      });
    });

    msg.reply({ embeds: [embed] });
  }
});

console.log("TOKEN:", process.env.TOKEN ? "ADA" : "KOSONG");
client.login(process.env.TOKEN);
