import express from 'express';
import { Client, Events, GatewayIntentBits } from "discord.js";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import {
  TEST_COMMAND,
  HasGuildCommands,
  RULES_COMMAND,
  HELP_COMMAND,
  SITE_COMMAND
} from './commands.js';

// Create an express app
const app = express();
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};
const token = 'MTA3NzU5NTQ5NjcxNTEzNzE2Ng.GlmoDx.3Fha_5auK5FA3YCHQjxz6kZvS6PDLwH7S2VGns';


const client = new Client({ intents: [GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,] });


/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;
  
  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" guild command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }

    if( name === 'rules'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content:  "⛔️ NO richieste personali a Mirko e Matteo. Per queste usate sempre la chat privata di FB o whatsapp! \n"
              + "⛔️ NO continui spam se le carte non interessano \n"
              + "⛔️ VIETATO proporre articoli di card game o Funko Pop! Che indirizzino ad altri negozi o store online. \n"
              + "⛔️ VIETATO vendere materiale sealed a meno che non sia materiale old o appartengano alla propria collezione privata \n"
              + "✅ possibilità di condividere link di aste o claim nei vari gruppo \n"
              + "✅ possibilità di proporre carte in vendita di tutto il TCG \n"
        },
      });
    }

    if( name === 'help'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content:  "Per qualsiasi dubbio contattate pure @Kr4ken, @molizenai, @rosta95"
        },
      });
    }
    
    if( name === 'site'){
      
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Nerdstore a tutto tondo!',
          // Buttons are inside of action rows
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  label: 'Sito NerdStore',
                  style: 5,
                  url: 'http://nerdstoreitalia.it/'
                },{
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  label: 'Gruppo Whatsapp',
                  style: 5,
                  url: 'http://nerdstoreitalia.it/'
                }
              ],
            },
          ],
        },
      });
    }

  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;
    
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');

  client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
  });

  client.on("guildMemberAdd", (member) => {
    console.log(`New User "${member.user.username}" has joined "${member.guild.name}"` );
    let msg = `"${member.user.username}" si è unito!\n Grazie per essere entrato sei il benvenuto!`
    member.guild.channels.cache.find(c => c.name === "pokemoncenter").send(msg);
  });

  client.on("messageCreate",msg => {
    if(msg.content.toLowerCase() === "ping"){
      msg.reply("pong")
    }
    if(msg.content.toLowerCase().indexOf("paypalmerda") !== -1){
      msg.reply("cestra libero " + getRandomEmoji())
    }
  })

  client.login(token);
  // Check if guild commands from commands.json are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    TEST_COMMAND,
    RULES_COMMAND,
    HELP_COMMAND,
    SITE_COMMAND
  ]);
});
