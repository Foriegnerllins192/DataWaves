class PricingService {
  constructor() {
    // Default markups for each network (in percentage)
    this.markups = {
      'mtn': 5.0,        // 5% markup
      'telecel': 7.5,    // 7.5% markup
      'airteltigo': 6.0, // 6% markup
      'glo': 8.0         // 8% markup
    };
  }

  // Calculate customer price based on base price and markup
  calculateCustomerPrice(basePrice, network) {
    const markup = this.markups[network.toLowerCase()] || 0;
    return basePrice * (1 + markup / 100);
  }

  // Get markup for a network
  getMarkup(network) {
    return this.markups[network.toLowerCase()] || 0;
  }

  // Set markup for a network
  setMarkup(network, markupPercentage) {
    this.markups[network.toLowerCase()] = markupPercentage;
  }

  // Get all markups
  getAllMarkups() {
    return this.markups;
  }
}

module.exports = new PricingService();