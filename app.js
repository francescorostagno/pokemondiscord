import express from 'express';
import {InteractionResponseType, InteractionType, MessageComponentTypes,} from 'discord-interactions';
import {getRandomEmoji, VerifyDiscordRequest} from './utils.js';
import {
  HasGuildCommands,
  HELP_COMMAND,
  NERDSTORE_COMMAND,
  RULES_COMMAND,
  SELL_RULES_COMMAND,
  TEST_COMMAND,
  ADD_FEEDBACK
} from './commands.js';

// Create an express app
const app = express();
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

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

    switch(name){
      case 'test':
          // Send a message into the channel where command was triggered from
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: 'hello world ' + getRandomEmoji(),
          },
        });
      case 'rules':
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

      case 'sell_rules':
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: "I Post Nei Canali Di Vendita Devono Contentere: \n"
                    + "✅ Nome della carta \n"
                    + "✅ Nome del set \n"
                    + "✅ Lingua \n"
                    + "✅ Condizioni \n"
                    + "✅ Prezzo \n"
          }
        })

      case 'help':
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content:  "Per qualsiasi dubbio contattate pure @Kr4ken, @molizenai, @rosta95",
            components: [
              {
                 type: MessageComponentTypes.ACTION_ROW,
                 components: [
                   {
                     type: 7,
                     custom_id : 'help_menu'
                   }
                 ]
                 
              }
            ],
          },
        });
      case 'nerdstore':
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
                      url: 'https://chat.whatsapp.com/IUOcNPo0pWwKcq7PHcNvEe'
                    }
                  ],
                },
              ],
            },
          });
      case 'add_feedback':
        return res.send({
          type: InteractionResponseType.APPLICATION_MODAL,
          data:{
            title: 'Aggiungi un feedback',
            custom_id: "add_feedback",
            components: [{
              type: MessageComponentTypes.ACTION_ROW,
              components: [{
                type: MessageComponentTypes.STRING_SELECT,
                custom_id: "evaluation",
                options: [
                  {
                    label: 'Positivo',
                    value: 'positive',
                    description: 'Positivo',
                    emoji: {
                        name: "white_check_mark",
                        id: '1083320866227626055'
                    }
                  },
                  {
                    label: 'Negativo',
                    value: 'negative',
                    description: 'Negativo',
                    emoji: {
                      name: "no_entry",
                      id: "1083320866227626055"
                    }
                  }
                ]
              },{
                type: MessageComponentTypes.INPUT_TEXT,
                custom_id: "feedback",
                label: "Aggiungi un nuovo feedback",
                style: 1,
              }]
            }]

          }
        })
    }
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;
    const userId = req.body.member.user.id;
    const objectName = data.values[0];
    switch(componentId){
      case 'help_menu':

        console.log(userId);
        console.log(objectName);
         // Send results
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `<@${userId}> ti sta cercando <@${objectName}>` },
        });
    }
    
  }

  if( type === InteractionType.APPLICATION_MODAL_SUBMIT ){
    const componentId = data.custom_id
    switch (componentId){
      case "add_feedback":
        console.log(data.components[0].components[0].value)
        console.log(data.components[1].components[0].value)
       console.log(data);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `Aggiunto` },
        });
    }
  }
});

app.get('/',function (req, res){
  res.send('Pokemon Discord Bot');
})

app.listen(3000, () => {
  // Check if guild commands from commands.json are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    TEST_COMMAND,
    RULES_COMMAND,
    HELP_COMMAND,
    NERDSTORE_COMMAND,
    SELL_RULES_COMMAND,
    ADD_FEEDBACK
  ]);
});

