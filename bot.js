// ============================================================
//  CLEAN DISCORD BOT (UPGRADED + ANALYTICS + VALO PERSONALITY)
// ============================================================

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const WELCOME_CHANNEL_NAME = 'welcome';
const AUTO_ROLE_NAME = 'Member';
const PREFIX = '!';

// MEMORY + STATS
const memory = new Map();
const stats = {};

// READY
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity('your server 👀', { type: 'WATCHING' });
});

// WELCOME + ROLE
client.on('guildMemberAdd', async (member) => {
  try {
    const role = member.guild.roles.cache.find(r => r.name === AUTO_ROLE_NAME);
    if (role) await member.roles.add(role);
  } catch {}

  const channel = member.guild.channels.cache.find(c => c.name === WELCOME_CHANNEL_NAME);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`👋 Welcome to ${member.guild.name}!`)
    .setDescription(`Hey ${member}, glad you're here! 🎉`)
    .setColor(0x5865F2);

  channel.send({ embeds: [embed] });
});

// FUN DATA
const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😄",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾"
];

const eightBallResponses = [
  'Yes', 'No', 'Maybe', 'Definitely', 'Not happening'
];

// MAIN LOGIC
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 📊 TRACK STATS
  const userId = message.author.id;
  if (!stats[userId]) stats[userId] = { messages: 0 };
  stats[userId].messages++;

  // ================= COMMANDS =================
  if (message.content.startsWith(PREFIX)) {
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // VALO WITH PERSONALITY
    if (command === 'valo') {
      const input = args[0];
      if (!input || !input.includes("#")) {
        return message.reply("Use: !valo username#tag");
      }

      const [name, tag] = input.split("#");

      try {
        const res = await axios.get(
          `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`
        );

        const player = res.data.data;

        const personalities = [
          "Entry fragger. Runs in and dies first 😭",
          "Baiter. Lets team die then gets kills 💀",
          "Support player. Actually useful for once",
          "Instalock duelist. No aim, only confidence",
          "Rank grinder. Plays like life depends on it"
        ];

        const personality = personalities[Math.floor(Math.random() * personalities.length)];

        await message.channel.sendTyping();
        return message.reply(
          `${player.name}#${player.tag}\n\nPlaystyle: ${personality}`
        );

      } catch {
        return message.reply("Couldn't find that player.");
      }
    }

    // 📊 STATS COMMAND
    if (command === 'stats') {
      const sorted = Object.entries(stats)
        .sort((a, b) => b[1].messages - a[1].messages);

      if (!sorted.length) return message.reply("No data yet.");

      const topUser = sorted[0];

      return message.reply(
        `Top chatter: <@${topUser[0]}> with ${topUser[1].messages} messages`
      );
    }

    if (command === 'joke') {
      return message.reply(jokes[Math.floor(Math.random() * jokes.length)]);
    }

    if (command === '8ball') {
      return message.reply(eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)]);
    }

    if (command === 'help') {
      return message.reply("Commands: !valo, !joke, !8ball, !stats");
    }
  }

  // ================= MENTION CHAT =================
  if (message.mentions.has(client.user)) {
    const userMessage = message.content
      .replace(`<@${client.user.id}>`, '')
      .replace(`<@!${client.user.id}>`, '')
      .trim()
      .toLowerCase();

    // 🇮🇳 Hindi detection
    const hindiWords = ["kya", "kaise", "nahi", "haan", "bhai", "kyu", "kahan"];
    if (hindiWords.some(word => userMessage.includes(word))) {
      await message.channel.sendTyping();
      return message.reply("bhai hindi nahi aati, english pls, i am foreign bot 😭");
    }

    // MEMORY
    if (!memory.has(userId)) memory.set(userId, {});
    const userMemory = memory.get(userId);

    if (userMessage.includes("my name is")) {
      const name = userMessage.split("my name is")[1].trim();
      userMemory.name = name;
      return message.reply(`Got it, ${name}`);
    }

    if (userMessage.includes("what's my name")) {
      return message.reply(userMemory.name || "You never told me 🤨");
    }

    // CUSTOM LOGIC
    if (userMessage.includes("hello bro")) {
      const replies = [
        "haan bro (thats all the hindi I could afford)",
        "haan btao?"
      ];
      await message.channel.sendTyping();
      return message.reply(replies[Math.floor(Math.random() * replies.length)]);
    }

    if (userMessage.includes("good morning bro")) {
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const hours = istTime.getHours();

      let timeOfDay = "night";
      if (hours < 12) timeOfDay = "morning";
      else if (hours < 17) timeOfDay = "afternoon";
      else if (hours < 21) timeOfDay = "evening";

      await message.channel.sendTyping();
      return message.reply(`bro good morning at ${timeOfDay} 💀`);
    }

    if (userMessage.includes("i am sad") || userMessage.includes("im sad")) {
      await message.channel.sendTyping();
      return message.reply(
        "I'd play you Lonely. but i cant, so here's the song link https://www.youtube.com/watch?v=djU4Lq_5EaM"
      );
    }

    if (userMessage.includes("play valo")) {
      await message.channel.sendTyping();
      return message.reply("Hatt 💀");
    }

    // GENERAL CONVO
    if (userMessage.includes("hi") || userMessage.includes("hello")) {
      await message.channel.sendTyping();
      return message.reply("Yo 😎 what's up?");
    }

    if (userMessage.includes("how are you")) {
      await message.channel.sendTyping();
      return message.reply("Alive and watching 👀");
    }

    if (userMessage.includes("?")) {
      const answers = ["Maybe", "Nope", "Yes", "Bad idea", "Go for it"];
      await message.channel.sendTyping();
      return message.reply(answers[Math.floor(Math.random() * answers.length)]);
    }

    const fallback = [
      "Tell me more",
      "Interesting...",
      "Explain that",
      "I'm listening"
    ];

    await message.channel.sendTyping();
    return message.reply(fallback[Math.floor(Math.random() * fallback.length)]);
  }

  // RANDOM CHAT
  if (Math.random() < 0.2) {
    const msg = message.content.toLowerCase();

    if (msg.includes("bored")) {
      await message.channel.sendTyping();
      return message.reply("Same 😭");
    }

    if (msg.includes("game")) {
      await message.channel.sendTyping();
      return message.reply("Don't say Valorant 💀");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);