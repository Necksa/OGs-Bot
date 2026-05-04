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
    // 🔥 ROAST COMMAND
if (command === 'roast') {
  const target = message.mentions.users.first();

  if (!target) {
    return message.reply("Tag someone to roast 😭");
  }

  if (target.id === message.author.id) {
    return message.reply("You want me to roast you? Respect 💀");
  }

  if (target.id === client.user.id) {
    return message.reply("Nice try 😏 not happening");
  }

  const roasts = [
    "bro plays like WiFi on 1 bar 💀",
    "you’re not useless, you’re just… limited edition",
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
    "you don’t carry, you get carried… emotionally",
    "you make bad decisions look creative",
    "you’re consistent… at being inconsistent",
    "you got the confidence of a pro and aim of a potato",
    "your minimap awareness is fictional",
    "you think before you act… but still choose wrong",
    "you play like you’re lagging in real life",
    "you don’t choke, you pre-choke",
    "you’re not trolling, you’re naturally like this",
    "you’re the reason teammates mute themselves",
    "your strategy is just hope",
    "you reload at the worst possible time every time",
    "you don’t miss… you avoid",
    "you got that spectator energy",
    "you’re built like a disconnect",
    "you play like patch notes didn’t reach you",
    "you got zero map control and full confidence",
    "you don’t rotate, you disappear",
    "you’re the warm-up for enemy team",
    "you aim like it’s a suggestion",
    "you play like your keyboard is optional",
    "you got main character energy with side character impact",
    "you don’t throw games, you gift them",
    "you peak once and never emotionally recover",
    "you got talent… just not here",
    "you’re the definition of ‘unlucky’ according to yourself",
    "you don’t learn from mistakes, you repeat them",
    "you’re not bad, you’re just misunderstood by skill",
    "you bring chaos but not value",
    "you got aim assist… it assists the enemy",
    "you’re the practice mode for opponents",
    "you got more excuses than kills"
  ];

  const roast = roasts[Math.floor(Math.random() * roasts.length)];

  await message.channel.sendTyping();
  return message.reply(`${target}, ${roast}`);
}
  }
});

client.login(process.env.DISCORD_TOKEN);