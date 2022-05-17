// Require the necessary discord.js classes
const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");
const { token, target_guild, target_channel } = require("./config.json");
const fs = require("fs").promises;

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const modal = new Modal().setCustomId("myModal").setTitle("My Modal");
const subject = new TextInputComponent()
  .setCustomId("subject")
  // The label is the prompt the user sees for this input
  .setLabel("Sujet")
  // Short means only a single line of text
  .setStyle("SHORT");
const content = new TextInputComponent()
  .setCustomId("content")
  .setLabel("Quel est votre message?")
  // Paragraph means multiple lines of text.
  .setStyle("PARAGRAPH")
  .setMaxLength(1024);
// An action row only holds one text input,
// so you need one action row per text input.
const firstActionRow = new MessageActionRow().addComponents(subject);
const secondActionRow = new MessageActionRow().addComponents(content);
modal.addComponents(firstActionRow, secondActionRow);

// When the client is ready, run this code (only once)
client.once("ready", async () => {
  console.log("Ready!");
  let data = JSON.parse(
    await fs.readFile("db.json").catch((e) => {
      return "{}";
    })
  );
  let targetMessage;
  if (data.messageID) {
    targetMessage = await client.guilds
      .fetch(target_guild)
      .then((e) => e.channels.fetch(target_channel))
      .then((e) => e.messages.fetch(data.messageID))
      .catch((e) => {
        console.error(e);
        return null;
      });
  }
  if (!targetMessage) {
    // send message
    const channel = client.channels.cache.get(target_channel);
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("anonymous_message")
        .setLabel("Envoyer un message anonyme")
        .setStyle("PRIMARY")
    );
    targetMessage = await channel.send({
      content:
        "Bonjour ! cliquez sur le bouton suivant pour faire exploser cette promotion!",
      components: [row],
    });
    // save message ID in json
    fs.writeFile(
      "./db.json",
      JSON.stringify({ messageID: `${targetMessage.id}` })
    );
  }

  // eventListener
  const collector = targetMessage.createMessageComponentCollector({
    componentType: "BUTTON",
  });
  collector.on("collect", async (i) => {
    await i.showModal(modal);
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  // Get the data entered by the user
  const subjectText = interaction.fields.getTextInputValue("subject");
  const contentText = interaction.fields.getTextInputValue("content");
  await interaction.reply({
    content: "Votre message a bien été reçu",
    ephemeral: true,
  });
  console.log(subjectText, contentText);
  if (contentText.length > 0 && subjectText.length > 0) {
    const exampleEmbed = new MessageEmbed()

      .setTitle("Message anonyme")
      .addField(subjectText, contentText)
      .setTimestamp();

    interaction.channel.send({ embeds: [exampleEmbed] });
  }
});

client.login(token);
