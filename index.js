const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 👉 GANTI sesuai server (code dari cfx.re/join/xxxx)
const SERVER_CODE = 'bak4pl';

client.on('ready', () => {
  console.log(`✅ Bot online sebagai ${client.user.tag}`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  // ================= HELP =================
  if (msg.content === '!helpfinder') {
    const embed = new EmbedBuilder()
      .setTitle('🔎 FiveM Player Finder')
      .setDescription('Cari player server INDOPRIDE')
      .addFields(
        { name: '📌 Command', value: '`!cari nama`' }
      )
      .setColor(0x00ffcc);

    return msg.reply({ embeds: [embed] });
  }

  // ================= SEARCH =================
  if (msg.content.startsWith('!cari')) {
    const keyword = msg.content.split(' ')[1]?.toLowerCase();
    if (!keyword) return msg.reply('❌ Masukkan nama player');

    try {
      const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${SERVER_CODE}`);
      const json = await res.json();

      // VALIDASI DATA
      if (!json || !json.Data || !json.Data.players) {
        return msg.reply('❌ Data server tidak tersedia');
      }

      const players = json.Data.players;

      // FILTER PLAYER
      const found = players.filter(p =>
        p.name && p.name.toLowerCase().includes(keyword)
      );

      if (found.length === 0) {
        return msg.reply('❌ Player tidak ditemukan');
      }

      // EMBED RESULT
      const embed = new EmbedBuilder()
        .setTitle('🎯 Player Ditemukan')
        .setColor(0xff0000)
        .setFooter({ text: `Total Player Online: ${players.length}` });

      found.slice(0, 10).forEach(p => {
        embed.addFields({
          name: `👤 ${p.name}`,
          value: `🆔 ID: ${p.id}\n📶 Ping: ${p.ping}ms`
        });
      });

      msg.reply({ embeds: [embed] });

    } catch (err) {
      console.log(err);
      msg.reply('❌ Gagal ambil data server');
    }
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
