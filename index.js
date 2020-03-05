const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const { WebClient } = require("@slack/web-api");

require("dotenv").config();
const port = 8080;
const app = express();
const token = process.env.RAFA_TOKEN;

const web = new WebClient(token);
const fifteenMinutesInMilliseconds = 900000;
const oneHourInMilliseconds = fifteenMinutesInMilliseconds * 4;

const setStatus = async (status_text, status_emoji, status_expiration) => {
  await web.users.profile.set({
    profile: {
      status_text,
      status_emoji,
      status_expiration
    }
  });
};

const postMessage = async (channel, text, as_user) => {
  await web.chat.postMessage({
    channel,
    text,
    as_user
  });
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send(200);
});

app.post("/brb", async (req, res) => {
  try {
    const newExpiration = (Date.now() + fifteenMinutesInMilliseconds) / 1000;
    const setStatusResponse = await setStatus(
      "Be Right Back!",
      ":brb:",
      newExpiration
    );
    const postMessageResponse = await postMessage(
      "DJLH5HHH6",
      "Hello World",
      true
    );

    res.send(200, {
      response_type: "ephemeral",
      text: "It's 80 degrees right now.",
      attachments: [
        {
          text: "Partly cloudy today and tomorrow"
        }
      ]
    });
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.post("/lunch", async (req, res) => {
  const newExpiration = (Date.now() + oneHourInMilliseconds) / 1000;
  console.log(newExpiration);
  try {
    const result = await setStatus("I am on Lunch", ":lunch:", newExpiration);
    console.log(result);
    res.send(200);
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.get("/auth", (req, res) => {
  res.sendFile(__dirname + "/add_to_slack.html");
});

app.get("/auth/redirect", async (req, res) => {
  const code = req.query.code;
  console.log(req.query);
  try {
    const result = await web.oauth.v2.access({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code
    });
    console.log(result.authed_user.access_token, result);
    res.send("Success!");
  } catch {
    console.log(JSONresponse);
    res
      .send("Error encountered: \n" + JSON.stringify(JSONresponse))
      .status(200)
      .end();
  }
});

app.listen(port, _ => {
  console.log(`Listening on port ${port}`);
});
