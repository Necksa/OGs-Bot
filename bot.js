// ============================================================
// OGS BOT - FULL OPTIMIZED VERSION
// ============================================================

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require('discord.js');

const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ============================================================
// CONFIG
// ============================================================

const PREFIX = '!';
const WELCOME_CHANNEL_NAME = 'welcome';
const AUTO_ROLE_NAME = 'Member';
const BUMP_CHANNEL_NAME = 'server-bump';

// ============================================================
// STORAGE
// ============================================================

const memory = new Map();
const stats = {};

// ============================================================
// ARRAYS
// ============================================================

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything 😭",
  "Why did the scarecrow win an award? He was outstanding in his field 🌾"
];

const eightBallResponses = [
  "Yes",
  "No",
  "Maybe",
  "Definitely",
  "Not happening"
];

const fallbackReplies = [
  "Tell me more 👀",
  "Interesting...",
  "Explain that properly 😭",
  "I'm listening",
  "That sounds sus ngl",
  "Go on..."
];

const valoPersonalities = [
  "Entry fragger. Runs in and dies first 😭",
  "Baiter. Lets team die then gets kills 💀",
  "Support player. Actually useful for once",
  "Instalock duelist. No aim, only confidence",
  "Rank grinder. Plays like life depends on it"
];

const valoFallbacks = [
  "Probably a ranked demon 😤",
  "Definitely bottom frag 😭",
  "Hardstuck but blames team 💀",
  "Aim good, brain missing",
  "Instalock duelist energy"
];

const roasts = [
  "bro plays like WiFi on 1 bar 💀",
  "you’re not useless, you’re just limited edition",
  "even NPCs have better decision making",
  "you don’t lose, you donate wins 😭",
  "your aim is just vibes at this point",
  "you’re the reason tutorials exist",
  "if bad plays were currency, you’d be rich",
  "you play like your monitor is off",
  "even bots report you",
  "you bring negative value to the team",
  "your gamesense left the chat",
  "you peek like you have a death wish",
  "bro installs confidence instead of skill",
  "you’re not clutch, you’re chaotic",
  "you aim like you're allergic to enemies",
  "you move like a tutorial glitch",
  "you’re the plot twist no one wanted",
  "you don’t carry, you get carried emotionally",
  "you make bad decisions look creative",
  "you’re consistent at being inconsistent",
  "you got the confidence of a pro and aim of a potato",
  "your minimap awareness is fictional",
  "you think before you act and still choose wrong",
  "you play like you’re lagging in real life",
  "you don’t choke, you pre-choke",
  "you’re not trolling, you’re naturally like this",
  "you’re the reason teammates mute themselves",
  "your strategy is just hope",
  "you reload at the worst possible time every time",
  "you don’t miss, you avoid",
  "you got spectator energy",
  "you’re built like a disconnect",
  "you play like patch notes didn’t reach you",
  "you got zero map control and full confidence",
  "you don’t rotate, you disappear",
  "you’re the warm-up for enemy team",
  "you aim like it’s a suggestion",
  "you play like your keyboard is optional",
  "you got main character energy with side character impact",
  "you don’t throw games, you gift them",
  "you peek once and never emotionally recover",
  "you got talent, just not here",
  "you’re the definition of unlucky according to yourself",
  "you don’t learn from mistakes, you repeat them",
  "you’re not bad, you’re misunderstood by skill",
  "you bring chaos but not value",
  "you got aim assist, it assists the enemy",
  "you’re the practice mode for opponents",
  "you got more excuses than kills"
];

// ============================================================
// READY
// ============================================================

client.once('ready', () => {

  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log('🔥 OGS BOT ONLINE');

  client.user.setActivity('your server 👀', {
    type: 'WATCHING'
  });

  // AUTO BUMP REMINDER
  setInterval(() => {

    client.guilds.cache.forEach(guild => {

      const channel = guild.channels.cache.find(
        c => c.name === BUMP_CHANNEL_NAME
      );

      if (!channel) return;

      channel.send('⏰ Time to bump the server with `/bump` 😎');

    });

  }, 1000 * 60 * 60 * 2);

});

// ============================================================
// WELCOME SYSTEM
// ============================================================

client.on('guildMemberAdd', async (member) => {

  try {

    const role = member.guild.roles.cache.find(
      r => r.name === AUTO_ROLE_NAME
    );

    if (role) {
      await member.roles.add(role);
    }

  } catch {}

  const channel = member.guild.channels.cache.find(
    c => c.name === WELCOME_CHANNEL_NAME
  );

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`👋 Welcome to ${member.guild.name}!`)
    .setDescription(`Hey ${member}, glad you're here! 🎉`)
    .setColor(0x5865F2);

  channel.send({ embeds: [embed] });

});

// ============================================================
// MAIN MESSAGE EVENT
// ============================================================

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  const userId = message.author.id;
  const msg = message.content.toLowerCase();

  // ============================================================
  // STATS
  // ============================================================

  if (!stats[userId]) {
    stats[userId] = { messages: 0 };
  }

  stats[userId].messages++;

  // ============================================================
  // COMMANDS
  // ============================================================

  if (message.content.startsWith(PREFIX)) {

    const args = message.content
      .slice(PREFIX.length)
      .trim()
      .split(/ +/);

    const command = args.shift().toLowerCase();

    // HELP
    if (command === 'help') {

      return message.reply(`
Commands:
!help
!joke
!8ball
!stats
!valo
!roast
      `);
    }

    // JOKE
    if (command === 'joke') {

      return message.reply(
        jokes[Math.floor(Math.random() * jokes.length)]
      );
    }

    // 8BALL
    if (command === '8ball') {

      return message.reply(
        eightBallResponses[
          Math.floor(Math.random() * eightBallResponses.length)
        ]
      );
    }

    // STATS
    if (command === 'stats') {

      const sorted = Object.entries(stats)
        .sort((a, b) => b[1].messages - a[1].messages);

      if (!sorted.length) {
        return message.reply('No data yet.');
      }

      const topUser = sorted[0];

      return message.reply(
        `📊 Top chatter: <@${topUser[0]}> with ${topUser[1].messages} messages`
      );
    }

    // ROAST
    if (command === 'roast') {

      const target = message.mentions.users.first();

      if (!target) {
        return message.reply('Tag someone to roast 😭');
      }

      if (target.id === message.author.id) {
        return message.reply('You want me to roast yourself? Respect 💀');
      }

      if (target.id === client.user.id) {
        return message.reply('Nice try 😏');
      }

      const roast =
        roasts[Math.floor(Math.random() * roasts.length)];

      await message.channel.sendTyping();

      return message.reply(`${target}, ${roast}`);
    }

    // VALO
    if (command === 'valo') {

      const input = args[0];

      if (!input || !input.includes('#')) {
        return message.reply('Use: !valo username#tag');
      }

      let [name, tag] = input.split('#');

      name = name.toLowerCase();
      tag = tag.toLowerCase();

      try {

        const res = await axios.get(
          `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`
        );

        const player = res.data.data;

        const personality =
          valoPersonalities[
            Math.floor(Math.random() * valoPersonalities.length)
          ];

        await message.channel.sendTyping();

        return message.reply(`
🎮 ${player.name}#${player.tag}

Playstyle:
${personality}
        `);

      } catch {

        const fallback =
          valoFallbacks[
            Math.floor(Math.random() * valoFallbacks.length)
          ];

        await message.channel.sendTyping();

        return message.reply(`
🎮 ${name}#${tag}

(API couldn't verify)

Playstyle:
${fallback}
        `);
      }
    }
  }

  // ============================================================
  // MENTION CHAT
  // ============================================================

  if (message.mentions.has(client.user)) {

    const userMessage = message.content
      .replace(`<@${client.user.id}>`, '')
      .replace(`<@!${client.user.id}>`, '')
      .trim()
      .toLowerCase();

    // MEMORY
    if (!memory.has(userId)) {
      memory.set(userId, {});
    }

    const userMemory = memory.get(userId);

    // HINDI DETECTION
    const hindiWords = [
      'kya',
      'kaise',
      'nahi',
      'haan',
      'bhai',
      'kyu',
      'kahan'
    ];

    if (
      hindiWords.some(word => userMessage.includes(word))
    ) {

      await message.channel.sendTyping();

      return message.reply(
        'bhai hindi nahi aati, english pls, i am foreign bot 😭'
      );
    }

    // MEMORY SYSTEM
    if (userMessage.includes('my name is')) {

      const name = userMessage
        .split('my name is')[1]
        .trim();

      userMemory.name = name;

      return message.reply(`Got it, ${name}`);
    }

    if (userMessage.includes("what's my name")) {

      return message.reply(
        userMemory.name || 'You never told me 🤨'
      );
    }

    // CUSTOM CHAT
    if (userMessage.includes('hello bro')) {

      const replies = [
        'haan bro (thats all the hindi I could afford)',
        'haan btao?'
      ];

      await message.channel.sendTyping();

      return message.reply(
        replies[Math.floor(Math.random() * replies.length)]
      );
    }

    if (userMessage.includes('good morning bro')) {

      const now = new Date();

      const istTime = new Date(
        now.toLocaleString('en-US', {
          timeZone: 'Asia/Kolkata'
        })
      );

      const hours = istTime.getHours();

      let timeOfDay = 'night';

      if (hours < 12) {
        timeOfDay = 'morning';
      } else if (hours < 17) {
        timeOfDay = 'afternoon';
      } else if (hours < 21) {
        timeOfDay = 'evening';
      }

      await message.channel.sendTyping();

      return message.reply(
        `bro good morning at ${timeOfDay} 💀`
      );
    }

    if (
      userMessage.includes('i am sad') ||
      userMessage.includes('im sad')
    ) {

      await message.channel.sendTyping();

      return message.reply(
        "I'd play you Lonely but I cant 😭 https://www.youtube.com/watch?v=djU4Lq_5EaM"
      );
    }

    if (
      userMessage.includes('play valo') ||
      userMessage.includes('play valorant')
    ) {

      await message.channel.sendTyping();

      return message.reply('Hatt 💀');
    }

    // GENERAL CHAT
    if (
      userMessage === 'hi' ||
      userMessage === 'hello'
    ) {

      await message.channel.sendTyping();

      return message.reply('Yo 😎 what’s up?');
    }

    if (userMessage.includes('how are you')) {

      await message.channel.sendTyping();

      return message.reply('Alive and watching 👀');
    }

    if (userMessage.includes('?')) {

      const replies = [
        'Maybe',
        'Nope',
        'Yes',
        'Bad idea',
        'Go for it 😏'
      ];

      await message.channel.sendTyping();

      return message.reply(
        replies[Math.floor(Math.random() * replies.length)]
      );
    }

    // FALLBACK
    await message.channel.sendTyping();

    return message.reply(
      fallbackReplies[
        Math.floor(Math.random() * fallbackReplies.length)
      ]
    );
  }

  // ============================================================
  // RANDOM CHAT
  // ============================================================

  if (Math.random() < 0.2) {

    if (msg.includes('bored')) {

      await message.channel.sendTyping();

      return message.reply('Same 😭');
    }

    if (msg.includes('game')) {

      await message.channel.sendTyping();

      return message.reply("Don't say Valorant 💀");
    }
  }
});

// ============================================================
// LOGIN
// ============================================================

client.login(process.env.DISCORD_TOKEN);
