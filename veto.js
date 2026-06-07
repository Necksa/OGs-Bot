const {
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField
} = require('discord.js');

const {
activeMapBans,
MAP_POOL
} = require('./mapban');

// ============================================================
// HELPERS
// ============================================================

function pretty(map) {
return (
map.charAt(0).toUpperCase() +
map.slice(1)
);
}

function buildMapButtons(
maps,
prefix
) {

const buttons = maps.map(map =>
new ButtonBuilder()
.setCustomId(
`${prefix}${map}`
)
.setLabel(
pretty(map)
)
.setStyle(
ButtonStyle.Danger
)
);

const rows = [];

for (
let i = 0;
i < buttons.length;
i += 5
) {

```
rows.push(
  new ActionRowBuilder()
    .addComponents(
      buttons.slice(
        i,
        i + 5
      )
    )
);
```

}

return rows;
}

function buildSideButtons(
prefix
) {

return [

```
new ActionRowBuilder()
  .addComponents(

    new ButtonBuilder()
      .setCustomId(
        `${prefix}attack`
      )
      .setLabel(
        'ATTACK'
      )
      .setStyle(
        ButtonStyle.Primary
      ),

    new ButtonBuilder()
      .setCustomId(
        `${prefix}defense`
      )
      .setLabel(
        'DEFENSE'
      )
      .setStyle(
        ButtonStyle.Success
      )

  )
```

];

}

// ============================================================
// COMMAND HANDLER
// ============================================================

async function handleCommand(
message,
command,
args
) {

// ==========================================================
// CANCEL
// ==========================================================

if (
command ===
'cancelban'
) {

```
if (
  !message.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  )
) {

  return message.reply(
    '❌ Only admins can cancel a veto.'
  );
}

activeMapBans.delete(
  message.channel.id
);

return message.reply(
  '🗑️ Veto cancelled.'
);
```

}

// ==========================================================
// STATUS
// ==========================================================

if (
command ===
'status'
) {

```
const session =
  activeMapBans.get(
    message.channel.id
  );

if (!session) {

  return message.reply(
    '❌ No active veto.'
  );
}

return message.reply(
```

`🎮 ${session.mode.toUpperCase()}

Current Turn:
<@${session.turn}>

Remaining Maps:

${session.maps
.map(
map =>
`• ${pretty(map)}`
)
.join('\n')}`

```
);
```

}

// ==========================================================
// BO1
// ==========================================================

if (
command ===
'bo1'
) {

```
const captainA =
  message.mentions.users.first();

const captainB =
  message.mentions.users.at(1);

if (
  !captainA ||
  !captainB
) {

  return message.reply(
    'Use: !bo1 @CaptainA @CaptainB'
  );
}

if (
  activeMapBans.has(
    message.channel.id
  )
) {

  return message.reply(
    '❌ A veto is already active.'
  );
}

activeMapBans.set(
  message.channel.id,
  {

    mode: 'bo1',

    captains: [
      captainA.id,
      captainB.id
    ],

    turn:
      captainA.id,

    maps:
      [...MAP_POOL]

  }
);

return message.channel.send({

  content:
```

`🎮 BO1 MAP BAN

${captainA} please ban a map.`,

```
  components:

    buildMapButtons(
      MAP_POOL,
      'bo1_'
    )

});
```

}

// ==========================================================
// BO3
// ==========================================================

if (
command ===
'bo3'
) {

```
const captainA =
  message.mentions.users.first();

const captainB =
  message.mentions.users.at(1);

if (
  !captainA ||
  !captainB
) {

  return message.reply(
    'Use: !bo3 @CaptainA @CaptainB'
  );
}

if (
  activeMapBans.has(
    message.channel.id
  )
) {

  return message.reply(
    '❌ A veto is already active.'
  );
}

activeMapBans.set(
  message.channel.id,
  {

    mode: 'bo3',

    captains: [
      captainA.id,
      captainB.id
    ],

    turn:
      captainA.id,

    maps:
      [...MAP_POOL],

    phase: 1,

    map1: null,
    map2: null,
    map3: null,

    side1: null,
    side2: null,
    side3: null

  }
);

return message.channel.send({

  content:
```

`🎮 BO3 VETO

STEP 1 / 10

<@${captainA.id}> please ban a map.`,

```
  components:

    buildMapButtons(
      MAP_POOL,
      'bo3_'
    )

});
```

}

}
async function handleInteraction(
interaction
) {

const session =
activeMapBans.get(
interaction.channel.id
);

if (!session)
return false;

// ==========================================================
// BO1
// ==========================================================

if (
interaction.customId.startsWith(
'bo1_'
)
) {

```
if (
  !session.captains.includes(
    interaction.user.id
  )
) {

  await interaction.reply({

    content:
      '❌ Only captains may participate.',

    ephemeral: true

  });

  return true;
}

if (
  interaction.user.id !==
  session.turn
) {

  await interaction.reply({

    content:
      '❌ It is not your turn.',

    ephemeral: true

  });

  return true;
}

const map =
  interaction.customId.replace(
    'bo1_',
    ''
  );

session.maps =
  session.maps.filter(
    m => m !== map
  );

if (
  session.maps.length === 1
) {

  const finalMap =
    session.maps[0];

  activeMapBans.delete(
    interaction.channel.id
  );

  await interaction.update({

    content:
```

`🎉 MAP SELECTED

${pretty(finalMap)}`,

```
    components: []

  });

  await interaction.channel.send({

    files: [
      `./photos/maps/${finalMap}.webp`
    ]

  });

  return true;
}

session.turn =
  session.turn ===
  session.captains[0]
    ? session.captains[1]
    : session.captains[0];

await interaction.update({

  content:
```

`❌ ${pretty(map)} banned

<@${session.turn}> please ban a map.`,

```
  components:
    buildMapButtons(
      session.maps,
      'bo1_'
    )

});

return true;
```

}

// ==========================================================
// BO3
// ==========================================================

if (
!interaction.customId.startsWith(
'bo3_'
)
) {
return false;
}

if (
!session.captains.includes(
interaction.user.id
)
) {

```
await interaction.reply({

  content:
    '❌ Only captains may participate.',

  ephemeral: true

});

return true;
```

}

await interaction.reply({

```
content:
  '⚠️ BO3 engine coming next section.',

ephemeral: true
```

});

return true;
}

module.exports = {

handleCommand,

handleInteraction

};
