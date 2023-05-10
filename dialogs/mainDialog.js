const {
  MessageFactory,
  InputHints,
  ActionTypes,
  CardFactory,
} = require("botbuilder");
const {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
} = require("botbuilder-dialogs");

const MAIN_WATERFALL_DIALOG = "mainWaterfallDialog";

class MainDialog extends ComponentDialog {
  constructor(cluRecognizer) {
    super("MainDialog");

    if (!cluRecognizer) {
      throw new Error(
        "[MainDialog]: Missing parameter 'cluRecognizer' is required"
      );
    }
    this.cluRecognizer = cluRecognizer;

    this.addDialog(
      new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
        this.introStep.bind(this),
        this.actStep.bind(this),
        this.finalStep.bind(this),
      ])
    );
    this.initialDialogId = MAIN_WATERFALL_DIALOG;
  }

  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  async introStep(stepContext) {
    if (!this.cluRecognizer.isConfigured) {
      const messageText =
        "NOTE: CLU is not configured. To enable all capabilities, add `CluAPIKey` and `CluAPIHostName` to the .env file.";
      await stepContext.context.sendActivity(
        messageText,
        null,
        InputHints.IgnoringInput
      );
      return await stepContext.next();
    }

    const cluResult = await this.cluRecognizer.executeCluQuery(
      stepContext.context
    );

    switch (this.cluRecognizer.topIntent(cluResult)) {
      case "OrderPizza": {
        await this.giveOption(stepContext);
        break;
      }
      case "TrackPizza": {
        await stepContext.context.sendActivity(
          "Your order will be delivered to you within 30 min."
        );
        break;
      }
      default:
        {
          const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${this.cluRecognizer.topIntent(
            cluResult
          )})`;
          await stepContext.context.sendActivity(
            didntUnderstandMessageText,
            didntUnderstandMessageText,
            InputHints.IgnoringInput
          );
        }
        return await stepContext.next();
    }
  }

  async actStep(stepContext) {
    const text = stepContext.activity.text.toLowerCase();
    switch (text) {
      case "veg":
        await stepContext.context.sendActivity("Please choose your veg pizza");
        await this.sendVegMenuCard(stepContext);
        break;
      case "non-veg":
        await stepContext.context.sendActivity(
          "Please choose your non-veg pizza"
        );
        await this.sendNonVegMenuCard(stepContext);
        break;
      case "buy":
        await stepContext.context.sendActivity(
          `Thanks for placing order! Your pizza will arrive to you soon`
        );
        break;
      default:
        await stepContext.context.sendActivity(
          `Please choose your pizza to place an order.`
        );
    }
  }

  async finalStep(stepContext) {
    if (stepContext.result) {
      const result = stepContext.result;
      const msg = "Thanks for ordering the pizza!";
      await stepContext.context.sendActivity(
        msg,
        msg,
        InputHints.IgnoringInput
      );
    }
    return await stepContext.replaceDialog(this.initialDialogId, {
      restartMsg: "What else can I do for you?",
    });
  }

  async greetings(stepContext) {
    const card = CardFactory.heroCard(
      "Welcome to the Pizza-Ordering-Bot",
      "Please press order for placing an order",
      CardFactory.images([
        "https://static.vecteezy.com/system/resources/previews/000/294/962/original/a-pizza-shop-on-white-background-vector.jpg",
      ]),
      [
        {
          type: ActionTypes.ImBack,
          title: "order",
          value: "order",
        },
      ]
    );
    const message = MessageFactory.attachment(card);
    await stepContext.context.sendActivity(message);
  }

  async giveOption(stepContext) {
    const card = CardFactory.heroCard(
      "Please choose your type of pizza",
      [
        "https://nomoneynotime.com.au/uploads/recipes/shutterstock_2042520416-1.jpg",
      ],
      [
        {
          type: ActionTypes.ImBack,
          title: "veg",
          value: "veg",
        },
        {
          type: ActionTypes.ImBack,
          title: "non-veg",
          value: "non-veg",
        },
      ]
    );
    const message = MessageFactory.attachment(card);
    await stepContext.context.sendActivity(message);
  }

  async sendVegMenuCard(stepContext) {
    await stepContext.context.sendActivity({
      attachments: [
        this.createHeroCard("Paneer Pizza"),
        this.createHeroCard("Corn Pizza"),
        this.createHeroCard("Onion Pizza"),
        this.createHeroCard("Tomato Pizza"),
      ],
      attachmentLayout: AttachmentLayoutTypes.Carousel,
    });
  }

  async sendNonVegMenuCard(stepContext) {
    await stepContext.context.sendActivity({
      attachments: [
        this.createHeroCard("Chicken Tikka Pizza"),
        this.createHeroCard("Chicken Peri-Peri Pizza"),
        this.createHeroCard("Chicken Farmhouse Pizza"),
        this.createHeroCard("Chicken Overloaded Pizza"),
      ],
      attachmentLayout: AttachmentLayoutTypes.Carousel,
    });
  }

  createHeroCard(pizzaName) {
    return CardFactory.heroCard(
      `${pizzaName}`,
      "4.2 ★★★☆ (93) · $$",
      CardFactory.images([
        "https://img.freepik.com/free-photo/pizza-pizza-filled-with-tomatoes-salami-olives_140725-1200.jpg?size=626&ext=jpg",
      ]),
      CardFactory.actions([
        {
          type: ActionTypes.ImBack,
          title: "Buy",
          value: "buy",
        },
      ])
    );
  }
}

module.exports.MainDialog = MainDialog;
