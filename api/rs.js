const { Bot } = require("grammy");
const axios = require("axios");
require("dotenv").config();
const fs = require("fs");

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  ctx.reply("Welcome");
});

bot.on("msg", async (ctx) => {
  const url = ctx.message.text.split(" ")[1];
  const postUrl = encodeURI(url + ".json");
  const response = await axios.get(postUrl);
  const post = response.data[0].data.children[0].data;

  if (post.url.includes("v.redd.it")) {
    const videoResponse = await axios({
      url: post.media.reddit_video.fallback_url,
      method: "GET",
      responseType: "stream",
    });

    videoResponse.data.pipe(fs.createWriteStream(`${post.id}.mp4`));
    ctx.reply(`Downloading Reddit video: ${post.title}`);

    videoResponse.data.on("end", () => {
      ctx.reply(`Finished downloading Reddit video: ${post.title}`);
    });
  } else {
    ctx.reply(`URL is not a v.redd.it video: ${post.url}`);
  }
});

bot.start();
