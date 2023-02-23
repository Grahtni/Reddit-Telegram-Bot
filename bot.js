require("dotenv").config();
const { Bot, HttpError, GrammyError } = require("grammy");
const RandomReddit = require("reddit-posts");
const path = require("path");

// Bot

const bot = new Bot(process.env.BOT_TOKEN);

// Commands

bot.command("start", async (ctx) => {
  await ctx
    .reply("*Welcome!* ✨ Send the name of a subreddit.", {
      parse_mode: "Markdown",
    })
    .then(console.log("New user added:", ctx.from))
    .catch((e) => console.error(e));
});

bot.command("help", async (ctx) => {
  await ctx
    .reply(
      "*@anzubo Project.*\n\n_This bot downloads random posts from Reddit.\nSend a subreddit name to try it out!_",
      { parse_mode: "Markdown" }
    )
    .then(console.log("Help command sent to", ctx.from.id))
    .catch((e) => console.error(e));
});

// Messages

bot.on("msg", async (ctx) => {
  console.log("Query received:", ctx.msg.text, "from", ctx.from.id);
  const status = await ctx.reply(`*Getting posts from r/${ctx.msg.text}*`, {
    parse_mode: "Markdown",
  });
  try {
    //const intervalId = setInterval(async () => {
    let extension = 0;
    for (let i = 0; extension !== ".mp4"; i++) {
      // await RandomReddit.GetRandompost(ctx.msg.text)
      // .then(async (data) => {
      const data = await RandomReddit.GetRandompost(ctx.msg.text);
      const extension = path.extname(data.ImageURL);
      const markdownChars = /[_*[\]()~`>#+-=|{}.!]/g;
      const title = data.title.replace(markdownChars, "\\$&");
      const author = data.Author.replace(markdownChars, "\\$&");
      console.log(data.ImageURL);

      if (extension === ".jpg") {
        await ctx.replyWithPhoto(data.ImageURL, {
          reply_to_message_id: ctx.msg.message_id,
          caption: `[${title}](${data.url})\n${data.UpVotes} upvotes\nBy ${author}`,
          parse_mode: "Markdown",
        });
        break;
        //clearInterval(intervalId);
      } else {
      }
    }
    //.catch((error) => {
    //console.error(error);
    //ctx.reply(
    //"*An error occured. Are you sure you sent a valid subreddit name?*",
    //{ parse_mode: "Markdown", reply_to_message_id: ctx.msg.message_id }
    //);
    //  clearInterval(intervalId);
    //});

    //}, 2000);
  } catch (error) {
    console.error(error);
    await ctx.reply(
      "*An error occured. Are you sure you sent a valid subreddit name?*",
      { parse_mode: "Markdown" }
    );
  }
  setTimeout(() => {
    bot.api.deleteMessage(ctx.from.id, status.message_id);
  }, 3000);

  /* try {
    const data = await RandomReddit.GetRandompost(ctx.msg.text);
    console.log(data.title); //returns title of a post. For example: "This is just an example!"
    console.log(data.SubredditPrefix); //return: r/aww
    console.log(data.IsNSFW); //return: false. If it is a NSFW post it will return true.
    console.log(data.UpVotes); //return: 919. Any number of post upvotes.
    console.log(data.ImageURL); //returns Image URL. For example: https://i.imgur.com/Example.jpg
    console.log(data.selftext); //returns selftext or description of a post. (String)
    console.log(data.url); //returns URL of post. For example: https://reddit.com/r/aww/comments/random/example/
    console.log(data.CommentsNum); // return: 4 or any number. It is for total comments number.
    console.log(data.Author); // Get an author username which returns a string.
    console.log(data.DownVotes); // DownVotes is just like data.UpVotes example and it returns number.
    const extension = path.extname(data.ImageURL);
    if (extension === ".jpg") {
      await ctx.replyWithPhoto(data.ImageURL, {
        reply_to_message_id: ctx.msg.message_id,
        caption: `[${data.title}](${data.url})\n${data.UpVotes} _upvotes\nBy ${data.Author}_`,
        parse_mode: "Markdown",
      });
    } else if (extension === ".mp4") {
      caption = data.UpVotes;
      await ctx.replyWithVideo(data.ImageURL, {
        reply_to_message_id: ctx.msg.message_id,
        caption: caption,
      });
    } else {
      await ctx.reply("*No valid Reddit link detected or post not found.*", {
        parse_mode: "Markdown",
        reply_to_message_id: ctx.msg.message_id,
        caption: data.title,
      });
    }
  } catch (error) {
    console.error(error);
    await ctx.reply("An error occured");
  }
  */
});

// Error

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(
    "Error while handling update",
    ctx.update.update_id,
    "\nQuery:",
    ctx.msg.text
  );
  ctx.reply("An error occurred");
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// Run

bot.start();
