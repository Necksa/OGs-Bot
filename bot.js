// ============================================================
//  YOUR DISCORD BOT  –  bot.js
//  Features: Welcome new members, Auto-assign roles, Fun commands
// ============================================================

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ──────────────────────────────────────────────
//  SETTINGS – change these to match your server
// ──────────────────────────────────────────────
const WELCOME_CHANNEL_NAME = 'welcome';       // Name of your welcome channel
const AUTO_ROLE_NAME       = 'Member';        // Role to give new members
const PREFIX               = '!';            // Command prefix

// ──────────────────────────────────────────────
//  BOT READY
// ──────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity('your server 👀', { type: 'WATCHING' });
});

// ──────────────────────────────────────────────
//  WELCOME NEW MEMBERS + AUTO-ROLE
// ──────────────────────────────────────────────
client.on('guildMemberAdd', async (member) => {
  // --- Auto-assign role ---
  try {
    const role = member.guild.roles.cache.find(r => r.name === AUTO_ROLE_NAME);
    if (role) {
      await member.roles.add(role);
      console.log(`✅ Gave "${AUTO_ROLE_NAME}" role to ${member.user.tag}`);
    } else {
      console.warn(`⚠️  Role "${AUTO_ROLE_NAME}" not found. Check the name in SETTINGS.`);
    }
  } catch (err) {
    console.error('Error assigning role:', err.message);
  }

  // --- Welcome message ---
  const channel = member.guild.channels.cache.find(
    c => c.name === WELCOME_CHANNEL_NAME
  );
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`👋 Welcome to ${member.guild.name}!`)
    .setDescription(
      `Hey ${member}, we're so glad you're here!\n\n` +
      `📌 Check the rules channel to get started.\n` +
      `💬 Introduce yourself and say hi!\n` +
      `🎉 We now have **${member.guild.memberCount}** members!`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setColor(0x5865F2)
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

// ──────────────────────────────────────────────
//  FUN COMMANDS
// ──────────────────────────────────────────────
const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😄",
  "I told my wife she was drawing her eyebrows too high. She looked surprised. 🤨",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "I'm reading a book about anti-gravity. It's impossible to put down! 📚",
  "Why do cows wear bells? Because their horns don't work! 🐄",
  "What do you call fake spaghetti? An impasta! 🍝",
  "Why can't you give Elsa a balloon? She'll let it go! 🎈",
  "I used to hate facial hair, but then it grew on me. 🧔",
  "What's a skeleton's least favourite room? The living room! 💀",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
];

const eightBallResponses = [
  '✅ It is certain.',
  '✅ Without a doubt.',
  '✅ Yes, definitely!',
  '✅ You may rely on it.',
  '🤔 Reply hazy, try again.',
  '🤔 Ask again later.',
  '🤔 Cannot predict now.',
  '❌ Don\'t count on it.',
  '❌ My reply is no.',
  '❌ Very doubtful.',
];

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args    = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // --- !help ---
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 Bot Commands')
      .setColor(0x5865F2)
      .addFields(
        { name: '`!joke`',           value: 'Get a random joke 😄',           inline: true },
        { name: '`!8ball <question>`', value: 'Ask the magic 8-ball 🎱',      inline: true },
        { name: '`!flip`',           value: 'Flip a coin 🪙',                inline: true },
        { name: '`!roll [X]`',       value: 'Roll a dice (default: 6-sided) 🎲', inline: true },
        { name: '`!hug @user`',      value: 'Send a virtual hug 🤗',          inline: true },
        { name: '`!serverinfo`',     value: 'Server stats 📊',                inline: true },
      )
      .setFooter({ text: `Prefix: ${PREFIX}` });
    return message.reply({ embeds: [embed] });
  }

  // --- !joke ---
  if (command === 'joke') {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return message.reply(joke);
  }

  // --- !8ball ---
  if (command === '8ball') {
    const question = args.join(' ');
    if (!question) return message.reply('❓ Ask me a question! e.g. `!8ball Will I win today?`');
    const answer = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
    const embed = new EmbedBuilder()
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: 'Question', value: question },
        { name: 'Answer',   value: answer },
      )
      .setColor(0x2f3136);
    return message.reply({ embeds: [embed] });
  }

  // --- !flip ---
  if (command === 'flip') {
    const result = Math.random() < 0.5 ? '🪙 Heads!' : '🪙 Tails!';
    return message.reply(result);
  }

  // --- !roll ---
  if (command === 'roll') {
    const sides = parseInt(args[0]) || 6;
    if (sides < 2 || sides > 1000) return message.reply('Please pick between 2 and 1000 sides!');
    const result = Math.floor(Math.random() * sides) + 1;
    return message.reply(`🎲 You rolled a **${result}** (d${sides})`);
  }

  // --- !hug ---
  if (command === 'hug') {
    const target = message.mentions.users.first();
    if (!target) return message.reply('Tag someone to hug! e.g. `!hug @friend`');
    return message.reply(`🤗 ${message.author} gives ${target} a big warm hug!`);
  }

  // --- !serverinfo ---
  if (command === 'serverinfo') {
    const guild = message.guild;
    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👥 Members',  value: `${guild.memberCount}`,                              inline: true },
        { name: '📅 Created',  value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '🌍 Region',   value: guild.preferredLocale,                               inline: true },
      )
      .setColor(0x5865F2)
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }
});

// ──────────────────────────────────────────────
//  START THE BOT  (token comes from environment)
// ──────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
