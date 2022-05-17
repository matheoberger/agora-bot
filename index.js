// Require the necessary discord.js classes
const { Client, Intents } = require("discord.js");
const { token, target_guild, target_channel } = require("./config.json");
const fs = require("fs").promises;

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once("ready", async () => {
  console.log("Ready!");
  let data = JSON.parse(
    await fs.readFile("db.json").catch((e) => {
      return {};
    })
  );
  console.log(data);
  let targetMessage;
  if (data.messageID) {
    targetMessage = await client.guilds
      .fetch(target_guild)
      .then((e) => e.channels.fetch(target_channel))
      .then((e) => e.messages.fetch(data.messageID))
      .catch((e) => {
        console.error(e);
        return {};
      });
  }
  if (!targetMessage) {
    // send message
    // save message ID in json
  }

  // eventListener
});

client.on("interactionCreate", (e) => {
  console.log(e);
});
// Login to Discord with your client's token
client.login(token);
