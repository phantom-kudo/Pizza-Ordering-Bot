const { CardFactory } = require("botbuilder-core");
const { DialogBot } = require("./dialogBot");

class DialogAndWelcomeBot extends DialogBot {
  constructor(conversationState, userState, dialog) {
    super(conversationState, userState, dialog);

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          await this.greetings(context);
          await dialog.run(
            context,
            conversationState.createProperty("DialogState")
          );
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
}

module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
