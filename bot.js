// ============================================================
// OGS BOT - FINAL WORKING SUSHI VERSION + VCT VETO SYSTEM
// ============================================================

const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField,
ChannelType,
StringSelectMenuBuilder,
SlashCommandBuilder,
REST,
Routes
} = require('discord.js');

const axios = require('axios');
const fs = require('fs');

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
const WELCOME_CHANNEL_NAME = '👋・welcome';
const AUTO_ROLE_NAME = 'Member';
const BUMP_CHANNEL_NAME = 'server-bump';

const OWNER_ID = '613760928671989762';

const OWNER_VALO_NAMES = [
'necksa',
'lsdxnecksa'
];

// ============================================================
// VETO SYSTEM
// ============================================================

const activeVetos = new Map();

const MAP_POOL = [
'Ascent',
'Breeze',
'Fracture',
'Split',
'Lotus',
'Pearl',
'Haven'
];

// ============================================================
// ANTI SPAM CONFIG
// ============================================================

const FAMILY_ROLE_NAME = 'Family';

const SPAM_LIMIT = 5;
const SPAM_INTERVAL = 3000;
const SPAM_TIMEOUT = 3 * 60 * 1000;

const userMessages = new Map();

// ============================================================
// SUSHI PHOTO CONFIG
// ============================================================

const sushiCaptions = [
'real 😭',
'nahhh',
'average general chat',
'bro what',
'me rn',
'😭',
'wild',
'i cant do this anymore',
'HELPPPP',
'insane behavior'
];

let lastPhotoReply = 0;

const PHOTO_REPLY_COOLDOWN = 1000 * 60 * 10;

// ============================================================
// MEMORY + STATS
// ============================================================

const memory = new Map();
const stats = {};
const friendship = {};

// ============================================================
// DATA
// ============================================================

const jokes = [
"Why don't scientists trust atoms? Because they make up everything 😭",
"Why did the scarecrow win an award? He was outstanding in his field 🌾"
];

const eightBallResponses = [
'Yes',
'No',
'Maybe',
'Definitely',
'Not happening'
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
"your aim is just vibes at this point"
];

// ============================================================
// READY
// ============================================================

client.once('ready', async () => {

console.log(`✅ Logged in as ${client.user.tag}`);
console.log('🔥 OGS BOT ONLINE');

client.user.setActivity('watching the chaos 😭');

// REGISTER SLASH COMMAND

try {

```
const commands = [

  new SlashCommandBuilder()

    .setName('veto')

    .setDescription(
      'Start Valorant VCT Veto'
    )

    .toJSON()

];

const rest = new REST({
  version: '10'
}).setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationCommands(client.user.id),
  { body: commands }
);

console.log('✅ /veto registered');
```

} catch (err) {

```
console.log(err);
```

}

// BUMP REMINDER

setInterval(() => {

```
client.guilds.cache.forEach(guild => {

  const channel = guild.channels.cache.find(
    c => c.name === BUMP_CHANNEL_NAME
  );

  if (!channel) return;

  channel.send(
    '⏰ Time to bump the server with `/bump` 😎'
  );

});
```

}, 1000 * 60 * 60 * 2);

});

// ============================================================
// WELCOME SYSTEM
// ============================================================

client.on('guildMemberAdd', async (member) => {

try {

```
const role = member.guild.roles.cache.find(
  r => r.name === AUTO_ROLE_NAME
);

if (role) {
  await member.roles.add(role);
}
```

} catch (err) {

```
console.log(err);
```

}

const channel = member.guild.channels.cache.find(
c => c.name === '👋・welcome'
);

if (!channel) return;

const embed = new EmbedBuilder()

```
.setAuthor({
  name: 'OGs eSports',
  iconURL: member.guild.iconURL({ dynamic: true })
})

.setTitle('Welcome!')

.setDescription(
```

`✧ Welcome to the Epicness ${member}

✧ You Are Our ${member.guild.memberCount}th Member!

✧ Chat & Make Friends In <#732282717831430254>

✧ Read Rules Carefully In <#732281800092811376>

✧ Play Games & Have Fun!`
)

```
.setThumbnail(
  member.user.displayAvatarURL({ dynamic: true })
)

.setColor(0x5865F2);
```

channel.send({
embeds: [embed]
});

});

// ============================================================
// MAIN MESSAGE EVENT
// ============================================================

client.on('messageCreate', async (message) => {

if (message.author.bot) return;
if (!message.guild) return;

const member = message.member;

const now = Date.now();

const userId = message.author.id;

const msg = message.content.toLowerCase();

// ============================================================
// VETO LEADER TAGGING
// ============================================================

const veto =
activeVetos.get(message.channel.id);

if (
veto &&
veto.stage === 'leaders'
) {

```
const mentions =
  [...message.mentions.users.values()];

if (mentions.length !== 2) {

  return message.reply(
    '❌ Tag exactly 2 IGLs.'
  );

}

veto.leaders = [
  mentions[0],
  mentions[1]
];

veto.stage = 'running';

await message.channel.send(
```

`🎮 ${mentions[0]} vs ${mentions[1]}

❌ ${mentions[0]} bans first.`

```
);

return sendBanMenu(
  message.channel,
  veto
);
```

}

// ============================================================
// ANTI SPAM
// ============================================================

if (!member.roles.cache.some(
role => role.name === FAMILY_ROLE_NAME
)) {

```
if (!userMessages.has(userId)) {
  userMessages.set(userId, []);
}

let timestamps = userMessages.get(userId);

timestamps = timestamps.filter(
  t => now - t < SPAM_INTERVAL
);

timestamps.push(now);

userMessages.set(userId, timestamps);

if (timestamps.length >= SPAM_LIMIT) {

  try {

    await member.timeout(
      SPAM_TIMEOUT,
      'Spam detected'
    );

    await message.channel.send(
      `${message.author} got timed out for spamming 😭`
    );

    userMessages.delete(userId);

  } catch (err) {

    console.log(err);

  }

  return;
}
```

}

});

// ============================================================
// INTERACTIONS
// ============================================================

client.on('interactionCreate', async (interaction) => {

// ============================================================
// /VETO
// ============================================================

if (
interaction.isChatInputCommand() &&
interaction.commandName === 'veto'
) {

```
activeVetos.set(
  interaction.channel.id,
  {

    stage: 'leaders',

    maps: [...MAP_POOL],

    bans: [],

    picks: [],

    leaders: [],

    turn: 0,

    sideChoices: {}

  }
);

return interaction.reply({

  content:
```

`🎮 Valorant VCT Veto Started

Tag BOTH IGLs in one message.`

```
});
```

}

// ============================================================
// MAP BAN
// ============================================================

if (
interaction.isStringSelectMenu() &&
interaction.customId === 'veto_ban'
) {

```
const veto =
  activeVetos.get(interaction.channel.id);

if (!veto) return;

const currentLeader =
  veto.leaders[veto.turn];

if (
  interaction.user.id !== currentLeader.id
) {

  return interaction.reply({
    content: '❌ Not your turn.',
    ephemeral: true
  });

}

const selectedMap =
  interaction.values[0];

veto.maps =
  veto.maps.filter(
    map => map !== selectedMap
  );

veto.bans.push(selectedMap);

await interaction.reply(
```

`❌ ${currentLeader} banned **${selectedMap}**`
);

```
if (veto.bans.length === 1) {

  veto.turn = 1;

  return sendBanMenu(
    interaction.channel,
    veto
  );

}

if (veto.bans.length === 2) {

  veto.turn = 0;

  return sendPickMenu(
    interaction.channel,
    veto
  );

}

if (veto.bans.length === 3) {

  veto.turn = 1;

  return sendBanMenu(
    interaction.channel,
    veto
  );

}

if (veto.bans.length === 4) {

  const decider =
    veto.maps[0];

  const map1 =
    veto.picks[0];

  const map2 =
    veto.picks[1];

  const side1 =
    veto.sideChoices[map1];

  const side2 =
    veto.sideChoices[map2];

  const deciderSide =
    Math.random() > 0.5
      ? 'Attack'
      : 'Defense';

  const embed =
    new EmbedBuilder()

      .setTitle(
        '✅ VCT Veto Complete'
      )

      .setColor(0x5865F2)

      .setDescription(
```

`🗺️ **Map 1:** ${map1}
🔫 Picker Starts: ${side1}

🗺️ **Map 2:** ${map2}
🔫 Picker Starts: ${side2}

🗺️ **Map 3:** ${decider}
🎲 Random Side: ${deciderSide}`

```
      );

  activeVetos.delete(
    interaction.channel.id
  );

  return interaction.channel.send({
    embeds: [embed]
  });

}
```

}

// ============================================================
// MAP PICK
// ============================================================

if (
interaction.isStringSelectMenu() &&
interaction.customId === 'veto_pick'
) {

```
const veto =
  activeVetos.get(interaction.channel.id);

if (!veto) return;

const currentLeader =
  veto.leaders[veto.turn];

if (
  interaction.user.id !== currentLeader.id
) {

  return interaction.reply({
    content: '❌ Not your turn.',
    ephemeral: true
  });

}

const selectedMap =
  interaction.values[0];

veto.maps =
  veto.maps.filter(
    map => map !== selectedMap
  );

veto.picks.push(selectedMap);

veto.sideChoices[selectedMap] =
  veto.turn === 0
    ? 'Attack'
    : 'Defense';

await interaction.reply(
```

`✅ ${currentLeader} picked **${selectedMap}**`
);

```
if (veto.picks.length === 1) {

  veto.turn = 1;

  return sendPickMenu(
    interaction.channel,
    veto
  );

}

if (veto.picks.length === 2) {

  veto.turn = 0;

  return sendBanMenu(
    interaction.channel,
    veto
  );

}
```

}

});

// ============================================================
// SEND BAN MENU
// ============================================================

async function sendBanMenu(
channel,
veto
) {

const currentLeader =
veto.leaders[veto.turn];

const menu =
new StringSelectMenuBuilder()

```
  .setCustomId('veto_ban')

  .setPlaceholder(
    'Select map to ban'
  )

  .addOptions(

    veto.maps.map(map => ({

      label: map,

      value: map

    }))

  );
```

const row =
new ActionRowBuilder()
.addComponents(menu);

return channel.send({

```
content:
```

`❌ ${currentLeader}

Ban 1 map.`,

```
components: [row]
```

});

}

// ============================================================
// SEND PICK MENU
// ============================================================

async function sendPickMenu(
channel,
veto
) {

const currentLeader =
veto.leaders[veto.turn];

const menu =
new StringSelectMenuBuilder()

```
  .setCustomId('veto_pick')

  .setPlaceholder(
    'Select map to pick'
  )

  .addOptions(

    veto.maps.map(map => ({

      label: map,

      value: map

    }))

  );
```

const row =
new ActionRowBuilder()
.addComponents(menu);

return channel.send({

```
content:
```

`✅ ${currentLeader}

Pick 1 map.`,

```
components: [row]
```

});

}

// ============================================================
// LOGIN
// ============================================================

client.login(process.env.DISCORD_TOKEN);
