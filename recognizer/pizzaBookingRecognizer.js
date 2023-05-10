const { CluRecognizer } = require("../clu/cluRecognizer");

class PizzaBookingRecognizer {
  constructor(config) {
    const cluIsConfigured =
      config &&
      config.endpointKey &&
      config.endpoint &&
      config.projectName &&
      config.deploymentName;
    if (cluIsConfigured) {
      this.recognizer = new CluRecognizer(config);
    }
  }

  get isConfigured() {
    return this.recognizer !== undefined;
  }

  async executeCluQuery(context) {
    return await this.recognizer.recognizeAsync(context);
  }

  topIntent(response) {
    return response.result.prediction.topIntent;
  }
}

module.exports.PizzaBookingRecognizer = PizzaBookingRecognizer;
