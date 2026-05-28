// ============================================================
// OGS BOT - FULL VERSION + WORKING VETO SYSTEM
// DISCORD.JS v13
// ============================================================

const Discord = require('discord.js');

const {
Client,
Intents,
MessageEmbed,
MessageActionRow,
MessageButton,
MessageSelectMenu,
Permissions
} = Discord;

const axios = require('axios');
const fs = require('fs');

const client = new Client({
intents: [
Intents.FLAGS.GUILDS,
Intents.FLAGS.GUILD_MEMBERS,
Intents.FLAGS.GUILD_MESSAGES
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
// VETO CONFIG
// ============================================================

const MAP_POOL = [
'Ascent',
'Breeze',
'Fracture',
'Split',
'Lotus',
'Pearl',
'Haven'
];

const activeVetos = new Map();

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

const PHOTO_REPLY_COOLDOWN =
1000 * 60 * 10;

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

client.once('ready', () => {

console.log(`✅ Logged in as ${client.user.tag}`);
console.log('🔥 OGS BOT ONLINE');

client.user.setActivity(
'watching the chaos 😭'
);

// BUMP REMINDER

setInterval(() => {

```
client.guilds.cache.forEach(
  guild => {

    const channel =
      guild.channels.cache.find(
        c =>
          c.name ===
          BUMP_CHANNEL_NAME
      );

    if (!channel) return;

    channel.send(
      '⏰ Time to bump the server with `/bump` 😎'
    );

  }
);
```

}, 1000 * 60 * 60 * 2);

});

// ============================================================
// WELCOME SYSTEM
// ============================================================

client.on(
'guildMemberAdd',
async member => {

```
try {

  const role =
    member.guild.roles.cache.find(
      r =>
        r.name ===
        AUTO_ROLE_NAME
    );

  if (role) {

    await member.roles.add(role);

  }

} catch (err) {

  console.log(err);

}

const channel =
  member.guild.channels.cache.find(
    c =>
      c.name ===
      WELCOME_CHANNEL_NAME
  );

if (!channel) return;

const embed =
  new MessageEmbed()

    .setTitle('Welcome!')

    .setDescription(
```

`✧ Welcome ${member}

✧ You are our ${member.guild.memberCount}th member!

✧ Read rules and enjoy your stay 😎`

```
    )

    .setColor('#5865F2');

channel.send({
  embeds: [embed]
});
```

}
);

// ============================================================
// MAIN MESSAGE EVENT
// ============================================================

client.on(
'messageCreate',
async message => {

```
if (message.author.bot) return;
if (!message.guild) return;

const member = message.member;

const now = Date.now();

const userId =
  message.author.id;

const msg =
  message.content.toLowerCase();

// ============================================================
// HANDLE VETO IGL TAGGING
// ============================================================

const existingVeto =
  activeVetos.get(
    message.channel.id
  );

if (
  existingVeto &&
  existingVeto.stage ===
    'leaders'
) {

  const mentions =
    [...message.mentions.users.values()];

  if (mentions.length !== 2) {

    return message.reply(
      '❌ Tag EXACTLY 2 IGLs.'
    );

  }

  existingVeto.leaders = [
    mentions[0],
    mentions[1]
  ];

  existingVeto.stage =
    'running';

  await message.channel.send(
```

`🎮 **Valorant VCT Veto Started**

${mentions[0]} 🆚 ${mentions[1]}

❌ ${mentions[0]} bans first.`

```
  );

  return sendBanMenu(
    message.channel,
    existingVeto
  );

}

// ============================================================
// ANTI SPAM
// ============================================================

if (
  !member.roles.cache.some(
    role =>
      role.name ===
      FAMILY_ROLE_NAME
  )
) {

  if (
    !userMessages.has(userId)
  ) {

    userMessages.set(
      userId,
      []
    );

  }

  let timestamps =
    userMessages.get(userId);

  timestamps =
    timestamps.filter(
      t =>
        now - t <
        SPAM_INTERVAL
    );

  timestamps.push(now);

  userMessages.set(
    userId,
    timestamps
  );

  if (
    timestamps.length >=
    SPAM_LIMIT
  ) {

    try {

      await member.timeout(
        SPAM_TIMEOUT,
        'Spam detected'
      );

      await message.channel.send(
        `${message.author} got timed out for spamming 😭`
      );

      userMessages.delete(
        userId
      );

    } catch (err) {

      console.log(err);

    }

    return;

  }

}

// ============================================================
// STATS
// ============================================================

if (!stats[userId]) {

  stats[userId] = {
    messages: 0
  };

}

stats[userId].messages++;

// ============================================================
// COMMANDS
// ============================================================

if (
  message.content.startsWith(
    PREFIX
  )
) {

  const args =
    message.content
      .slice(PREFIX.length)
      .trim()
      .split(/ +/);

  const command =
    args.shift().toLowerCase();

  // ============================================================
  // HELP
  // ============================================================

  if (command === 'help') {

    return message.reply(
```

`Commands:
!help
!joke
!8ball
!stats
!valo
!roast
!ticketpanel
!pet
!friendship
!veto`

```
    );

  }

  // ============================================================
  // VETO
  // ============================================================

  if (command === 'veto') {

    if (
      activeVetos.has(
        message.channel.id
      )
    ) {

      return message.reply(
        '❌ A veto is already running.'
      );

    }

    activeVetos.set(
      message.channel.id,
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

    return message.channel.send(
```

`🎮 **Valorant VCT Veto**

Tag BOTH team IGLs in ONE message.

Example:
@Team1IGL @Team2IGL`

```
    );

  }

  // ============================================================
  // JOKE
  // ============================================================

  if (command === 'joke') {

    return message.reply(

      jokes[
        Math.floor(
          Math.random() *
            jokes.length
        )
      ]

    );

  }

  // ============================================================
  // 8BALL
  // ============================================================

  if (command === '8ball') {

    return message.reply(

      eightBallResponses[
        Math.floor(
          Math.random() *
            eightBallResponses.length
        )
      ]

    );

  }

  // ============================================================
  // STATS
  // ============================================================

  if (command === 'stats') {

    const sorted =
      Object.entries(stats)
        .sort(
          (a, b) =>
            b[1].messages -
            a[1].messages
        );

    if (!sorted.length) {

      return message.reply(
        'No data yet.'
      );

    }

    const topUser =
      sorted[0];

    return message.reply(
```

`📊 Top chatter:
<@${topUser[0]}>
with ${topUser[1].messages} messages`

```
    );

  }

  // ============================================================
  // ROAST
  // ============================================================

  if (command === 'roast') {

    const target =
      message.mentions.users.first();

    if (!target) {

      return message.reply(
        'Tag someone to roast 😭'
      );

    }

    if (
      target.id === OWNER_ID
    ) {

      return message.reply(
        'nah 😭 that’s my creator'
      );

    }

    const roast =
      roasts[
        Math.floor(
          Math.random() *
            roasts.length
        )
      ];

    return message.reply(
      `${target}, ${roast}`
    );

  }

  // ============================================================
  // VALO
  // ============================================================

  if (command === 'valo') {

    const input =
      args[0];

    if (
      !input ||
      !input.includes('#')
    ) {

      return message.reply(
        'Use: !valo username#tag'
      );

    }

    let [name, tag] =
      input.split('#');

    name =
      name.toLowerCase();

    tag =
      tag.toLowerCase();

    if (
      OWNER_VALO_NAMES.includes(
        name
      )
    ) {

      return message.reply(
```

`🎮 ${name}#${tag}

Playstyle:
best player alive 😭`

```
      );

    }

    try {

      const res =
        await axios.get(
          `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`
        );

      const player =
        res.data.data;

      const personality =
        valoPersonalities[
          Math.floor(
            Math.random() *
              valoPersonalities.length
          )
        ];

      return message.reply(
```

`🎮 ${player.name}#${player.tag}

Playstyle:
${personality}`

```
      );

    } catch {

      const fallback =
        valoFallbacks[
          Math.floor(
            Math.random() *
              valoFallbacks.length
          )
        ];

      return message.reply(
```

`🎮 ${name}#${tag}

(API couldn't verify)

Playstyle:
${fallback}`

```
      );

    }

  }

}
```

}
);

// ============================================================
// INTERACTION CREATE
// ============================================================

client.on(
'interactionCreate',
async interaction => {

```
// ============================================================
// SELECT MENUS
// ============================================================

if (
  interaction.isSelectMenu()
) {

  const veto =
    activeVetos.get(
      interaction.channel.id
    );

  if (!veto) return;

  const currentLeader =
    veto.leaders[
      veto.turn
    ];

  if (
    interaction.user.id !==
    currentLeader.id
  ) {

    return interaction.reply({
      content:
        '❌ Not your turn.',
      ephemeral: true
    });

  }

  // ============================================================
  // MAP BAN
  // ============================================================

  if (
    interaction.customId ===
    'veto_ban'
  ) {

    const selectedMap =
      interaction.values[0];

    veto.maps =
      veto.maps.filter(
        map =>
          map !==
          selectedMap
      );

    veto.bans.push(
      selectedMap
    );

    await interaction.reply(
```

`❌ ${currentLeader} banned **${selectedMap}**`

```
    );

    // FLOW

    if (
      veto.bans.length === 1
    ) {

      veto.turn = 1;

      return sendBanMenu(
        interaction.channel,
        veto
      );

    }

    if (
      veto.bans.length === 2
    ) {

      veto.turn = 0;

      return sendPickMenu(
        interaction.channel,
        veto
      );

    }

    if (
      veto.bans.length === 3
    ) {

      veto.turn = 1;

      return sendBanMenu(
        interaction.channel,
        veto
      );

    }

    if (
      veto.bans.length === 4
    ) {

      const deciderMap =
        veto.maps[0];

      const map1 =
        veto.picks[0];

      const map2 =
        veto.picks[1];

      const side1 =
        veto.sideChoices[
          map1
        ];

      const side2 =
        veto.sideChoices[
          map2
        ];

      const deciderSide =
        Math.random() > 0.5
          ? 'Attack'
          : 'Defense';

      const embed =
        new MessageEmbed()

          .setTitle(
            '✅ VCT Veto Complete'
          )

          .setColor(
            '#5865F2'
          )

          .setDescription(
```

`🗺️ Map 1: ${map1}
🔫 Picker Side: ${side1}

🗺️ Map 2: ${map2}
🔫 Picker Side: ${side2}

🗺️ Map 3: ${deciderMap}
🎲 Decider Side: ${deciderSide}`

```
          );

      activeVetos.delete(
        interaction.channel.id
      );

      return interaction.channel.send({
        embeds: [embed]
      });

    }

  }

  // ============================================================
  // MAP PICK
  // ============================================================

  if (
    interaction.customId ===
    'veto_pick'
  ) {

    const selectedMap =
      interaction.values[0];

    veto.maps =
      veto.maps.filter(
        map =>
          map !==
          selectedMap
      );

    veto.picks.push(
      selectedMap
    );

    veto.sideChoices[
      selectedMap
    ] =
      veto.turn === 0
        ? 'Attack'
        : 'Defense';

    await interaction.reply(
```

`✅ ${currentLeader} picked **${selectedMap}**`

```
    );

    if (
      veto.picks.length === 1
    ) {

      veto.turn = 1;

      return sendPickMenu(
        interaction.channel,
        veto
      );

    }

    if (
      veto.picks.length === 2
    ) {

      veto.turn = 0;

      return sendBanMenu(
        interaction.channel,
        veto
      );

    }

  }

}
```

}
);

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
new MessageSelectMenu()

```
  .setCustomId(
    'veto_ban'
  )

  .setPlaceholder(
    'Select map to ban'
  )

  .addOptions(

    veto.maps.map(
      map => ({

        label: map,

        value: map

      })
    )

  );
```

const row =
new MessageActionRow()
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
new MessageSelectMenu()

```
  .setCustomId(
    'veto_pick'
  )

  .setPlaceholder(
    'Select map to pick'
  )

  .addOptions(

    veto.maps.map(
      map => ({

        label: map,

        value: map

      })
    )

  );
```

const row =
new MessageActionRow()
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

client.login(
process.env.DISCORD_TOKEN
);
