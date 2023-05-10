const restify = require("restify");
require("dotenv/config");
const PORT = 3978 || process.env.PORT;
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

const {
  ConfigurationServiceClientCredentialFactory,
  CloudAdapter,
  MemoryStorage,
  ConversationState,
  UserState,
  createBotFrameworkAuthenticationFromConfiguration,
} = require("botbuilder");

const { DialogBot } = require("./bot/dialogBot");
const {
  PizzaBookingRecognizer,
} = require("./recognizer/pizzaBookingRecognizer");
const { DialogAndWelcomeBot } = require("./bot/dialogAndWelcomeBot");
const { MainDialog } = require("./dialogs/mainDialog");

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType,
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId,
});

const botFrameworkAuthentication =
  new createBotFrameworkAuthenticationFromConfiguration(
    null,
    credentialsFactory
  );
const adapter = new CloudAdapter(botFrameworkAuthentication);

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

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

const { CluAPIKey, CluAPIHostName, CluProjectName, CluDeploymentName } =
  process.env;
const cluConfig = {
  endpointKey: CluAPIKey,
  endpoint: `https://${CluAPIHostName}`,
  projectName: CluProjectName,
  deploymentName: CluDeploymentName,
};

const cluRecognizer = new PizzaBookingRecognizer(cluConfig);

const dialog = new MainDialog(cluRecognizer);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);
// const bot = new DialogBot(conversationState, userState, dialog);

server.listen(PORT, () => {
  console.log(`${server.name} listening to ${server.url}`);
});

server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, (context) => bot.run(context));
});
