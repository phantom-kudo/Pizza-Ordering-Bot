const {
  ActionTypes,
  ActivityHandler,
  CardFactory,
  MessageFactory,
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
    if (!dialog)
      throw new Error("[DialogBot]: Missing parameter. dialog is required");

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
          await this.sendVegMenuCard(context);
          break;
        case "non-veg":
          await this.sendNonVegMenuCard(context);
        case "buy":
          await context.sendActivity(`Thanks for placing order!`);

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
          await context.sendActivity(`Welcome to the Pizza Ordering Bot.`);
        }
      }
      await next();
    });
  }

  async giveOption(context) {
    const card = CardFactory.heroCard(
      "Please choose your type of pizza",
      ["https://aka.ms/bf-welcome-card-image"],
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

  async sendNonVegMenuCard(context) {
    const card = CardFactory.heroCard(
      "Please choose your favourite pizza from veg item menu",
      ["https://aka.ms/bf-welcome-card-image"],
      [
        {
          type: ActionTypes.ImBack,
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fpizza&psig=AOvVaw2oOVSny8N-ISBgrWJ_PC6m&ust=1683375691966000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCPjM66KV3v4CFQAAAAAdAAAAABAE",
          title: "Chicken Peri-Peri Pizza",
          value: "buy",
        },
        {
          type: ActionTypes.ImBack,
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fpizza&psig=AOvVaw2oOVSny8N-ISBgrWJ_PC6m&ust=1683375691966000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCPjM66KV3v4CFQAAAAAdAAAAABAE",
          title: "Chicken Farmhouse Pizza",
          value: "buy",
        },
        {
          type: ActionTypes.ImBack,
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fpizza&psig=AOvVaw2oOVSny8N-ISBgrWJ_PC6m&ust=1683375691966000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCPjM66KV3v4CFQAAAAAdAAAAABAE",
          title: "Chicken Barbeque Pizza",
          value: "buy",
        },
        {
          type: ActionTypes.ImBack,
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fpizza&psig=AOvVaw2oOVSny8N-ISBgrWJ_PC6m&ust=1683375691966000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCPjM66KV3v4CFQAAAAAdAAAAABAE",
          title: "Chicken Tikka Pizza",
          value: "buy",
        },
      ]
    );
    const message = MessageFactory.attachment(card);
    await context.sendActivity(message);
  }
  async sendVegMenuCard(context) {
    const card = CardFactory.heroCard(
      "Please choose your favourite pizza from veg item menu",
      ["https://aka.ms/bf-welcome-card-image"],
      [
        {
          type: ActionTypes.ImBack,
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fpizza&psig=AOvVaw2oOVSny8N-ISBgrWJ_PC6m&ust=1683375691966000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCPjM66KV3v4CFQAAAAAdAAAAABAE",
          title: "Paneer Pizza",
          value: "buy",
        },
        {
          type: ActionTypes.ImBack,
          contentType:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fpizza&psig=AOvVaw2oOVSny8N-ISBgrWJ_PC6m&ust=1683375691966000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCPjM66KV3v4CFQAAAAAdAAAAABAE",
          title: "Corn Pizza",
          value: "buy",
        },
      ]
    );
    const message = MessageFactory.attachment(card);
    await context.sendActivity(message);
  }

  async run(context) {
    await super.run(context);
    await this.conversationState.saveChanges(context);
    await this.userState.saveChanges(context);
  }
}

module.exports.PizzaBot = PizzaBot;
