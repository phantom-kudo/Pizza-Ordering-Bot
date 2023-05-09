const {
  ActionTypes,
  ActivityHandler,
  CardFactory,
  MessageFactory,
  AttachmentLayoutTypes,
} = require("botbuilder");

const PIZZA_BOT = "pizzaBotProperty";

class PizzaBot extends ActivityHandler {
  constructor(conversationState, userState) {
    super();
    if (!conversationState)
      throw new Error(
        "[DialogBot]: Missing parameter. conversationState is required"
      );
    if (!userState)
      throw new Error("[DialogBot]: Missing parameter. userState is required");

    this.pizzaBotProperty = userState.createProperty(PIZZA_BOT);
    this.conversationState = conversationState;
    this.userState = userState;

    this.onMessage(async (context, next) => {
      const text = context.activity.text.toLowerCase();
      switch (text) {
        case "hello":
        case "hi":
          await context.sendActivity(
            "What you want to order today? Type 'order' to proceed with orders."
          );
          break;
        case "order":
          await this.giveOption(context);
          break;
        case "veg":
          await context.sendActivity("Please choose your veg pizza");
          await this.sendVegMenuCard(context);
          break;
        case "non-veg":
          await context.sendActivity("Please choose your non-veg pizza");
          await this.sendNonVegMenuCard(context);
          break;
        case "buy":
          await context.sendActivity(
            `Thanks for placing order! Your pizza will arrive to you soon`
          );
          break;
        default:
          await context.sendActivity(`Please type 'order' to place an order.`);
      }
    });

    this.onMembersAdded(async (context, next) => {
      for (const idx in context.activity.membersAdded) {
        if (
          context.activity.membersAdded[idx].id !==
          context.activity.recipient.id
        ) {
          await this.greetings(context);
        }
      }
      await next();
    });
  }

  async greetings(context) {
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
    await context.sendActivity(message);
  }

  async giveOption(context) {
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
    await context.sendActivity(message);
  }

  async sendVegMenuCard(context) {
    await context.sendActivity({
      attachments: [
        this.createHeroCard("Paneer Pizza"),
        this.createHeroCard("Corn Pizza"),
        this.createHeroCard("Onion Pizza"),
        this.createHeroCard("Tomato Pizza"),
      ],
      attachmentLayout: AttachmentLayoutTypes.Carousel,
    });
  }

  async sendNonVegMenuCard(context) {
    await context.sendActivity({
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

  async run(context) {
    await super.run(context);
    await this.conversationState.saveChanges(context);
    await this.userState.saveChanges(context);
  }
}

module.exports.PizzaBot = PizzaBot;
