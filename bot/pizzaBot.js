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

    this.pizzaBotProperty = userState.createProperty(PIZZA_BOT);
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
          await this.sendMenuCard(context);
          break;
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

  async sendMenuCard(context) {
    const card = CardFactory.heroCard(
      "White T-Shirt",
      ["img/pizza.jpeg"],
      ["buy"]
    );
    const message = MessageFactory.attachment(card);
    await context.sendActivity(message);
  }

  async run(context) {
    await super.run(context);
    // await this.conversationState.saveChanges(context);
    await this.userState.saveChanges(context);
  }
}

module.exports.PizzaBot = PizzaBot;
