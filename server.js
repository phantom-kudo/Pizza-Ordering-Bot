const restify = require("restify");
require("dotenv/config");
const PORT = 3978 || process.env.PORT;
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

const {
  ConfigurationBotFrameworkAuthentication,
  CloudAdapter,
  MemoryStorage,
  ConversationState,
  UserState,
} = require("botbuilder");

const { PizzaBot } = require("./bot/pizzaBot");

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  process.env
);
const adapter = new CloudAdapter(botFrameworkAuthentication);

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const bot = new PizzaBot(conversationState, userState);

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );
  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
  await conversationState.delete(context);
};

server.listen(PORT, () => {
  console.log(`${server.name} listening to ${server.url}`);
});

server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, (context) => bot.run(context));
});
