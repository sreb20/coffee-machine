const assert = require('assert');

// Available product types
const AVAILABLE_PRODUCTS = ["w", "m", "c"];

const VALID_TYPES = ["espresso", "latte", "cappuccino"];

// Ingredients quantity required for each coffee type
const COFFEE_INGREDIENTS = {
    espresso: { w: 50, m: 0, c: 18 },
    latte: { w: 30, m: 150, c: 18 },
    cappuccino: { w: 30, m: 100, c: 18 }
};

// Capacity of the ingredients we can set in the coffee machine
const MAX_INGREDIENT_CAPACITY = {
    w: 1000,
    m: 1000,
    c: 1000
}

// CoffeeMachine class definition
class CoffeeMachine {
    constructor(water, milk, coffeeBeans) {
        this.validateIngredients(water, milk, coffeeBeans);
        this.w = water;
        this.m = milk;
        this.c = coffeeBeans;
    }

    // Method to validate if ingredients are valid numbers and non-negative
    validateIngredients(water, milk, coffeeBeans) {
        if (typeof water !== 'number' || typeof milk !== 'number' || typeof coffeeBeans !== 'number') {
            throw new Error("Ingredients values must be numbers.");
        }
        if (water < 0 || milk < 0 || coffeeBeans < 0) {
            throw new Error("Ingredient values must be greater than or equal to 0");
        }
    }

    // Make coffee of a specified type
    make(type) {
        const coffeeIngredient = COFFEE_INGREDIENTS[type];
        // Check if there the coffee type exist and if there are enough ingredients to do it
        if (!coffeeIngredient) {
            throw new Error("Unknown coffee type");
        }
        if (this.w < coffeeIngredient.w || this.m < coffeeIngredient.m || this.c < coffeeIngredient.c) {
            throw new Error("Not enough ingredients")
        }
        this.w -= coffeeIngredient.w;
        this.m -= coffeeIngredient.m;
        this.c -= coffeeIngredient.c;
        console.log(`${type} made`);
        return true; // Return true indicating successful preparation

    }

    // Refill a specific ingredient
    refill(product, amount) {
        if (!AVAILABLE_PRODUCTS.includes(product)) {
            throw new Error(`Refill for ${product} failed: the product is not available`);
        }
        if (amount < 0) {
            throw new Error(`Refill for ${product} failed: the amount needs to be a positive number`);
        }
        if (this[product] + amount > MAX_INGREDIENT_CAPACITY[product]) {
            throw new Error(`Refill for ${product} failed: the maximum capacity (${MAX_INGREDIENT_CAPACITY[product]}) has been exceeded`);
        }
        this[product] += amount;
    }

    // Check current inventory of ingredients
    checkInventory() {
        return {
            water: this.w,
            milk: this.m,
            coffeeBeans: this.c
        };
    }
}

// Process multiple orders on the coffee machine
const processOrders = (machine, orders) => {
    orders.forEach(order => {
        for (let j = order.servedCount; j < order.quantity; j++) {
            try {
                const res = machine.make(order.type);
                if (res) {
                    order.servedCount++;
                }
            }
            catch (error) {
                console.error(error.message);
            }
        }
    });
};

// Calculate total ingredients required for all orders
const calculateTotalIngredients = (orders) => {
    const total = { water: 0, milk: 0, coffeeBeans: 0 };
    orders.forEach(order => {
        const { w, m, c } = COFFEE_INGREDIENTS[order.type];
        total.water += w * order.quantity;
        total.milk += m * order.quantity;
        total.coffeeBeans += c * order.quantity;
    });
    return total;
};

// Check if orders are build in the good way
const checkOrders = (orders) => {
    console.log(orders);
    orders.forEach((order, index) => {
        if (!VALID_TYPES.includes(order.type)) {
            throw new Error(`Order at index ${index} has an invalid type: ${order.type}`);
        }
        if (typeof order.quantity !== 'number' || order.quantity < 0) {
            throw new Error(`Order at index ${index} has an invalid quantity: ${order.quantity}`);
        }
    });
}

// Initialize the servedCount property which tracks how many times a coffee of that type has been successfully served
const addServedCount = (orders) => {
    orders.forEach(order => {
        order.servedCount = 0;
    });
    return orders;
}

const setupOrders = (orders) => {
    checkOrders(orders);
    orders = addServedCount(orders);
    return orders;
}

// Test function for validation
const coffeeMachineTest = () => {
    let orders = [
        { type: "espresso", quantity: 2 },
        { type: "latte", quantity: 1 },
        { type: "cappuccino", quantity: 3 }
    ];

    try {
        setupOrders(orders);

        // Create a new CoffeeMachine instance
        const myMachine = new CoffeeMachine(500, 300, 100);

        assert.deepStrictEqual(myMachine.checkInventory(), { water: 500, milk: 300, coffeeBeans: 100 }, "Assertion Error: Initial inventory");

        processOrders(myMachine, orders);

        assert.deepStrictEqual(myMachine.checkInventory(), { water: 340, milk: 50, coffeeBeans: 28 }, "Assertion Error: Inventory after orders");
        assert.deepStrictEqual(calculateTotalIngredients(orders), { water: 220, milk: 450, coffeeBeans: 108 }, "Assertion Error: Total ingredients needed for orders");

        // Refill ingredients in the machine
        myMachine.refill('w', 100);
        myMachine.refill('m', 50);
        myMachine.refill('c', 20);

        assert.deepStrictEqual(myMachine.checkInventory(), { water: 440, milk: 100, coffeeBeans: 48 }, "Assertion Error: Inventory after refilling");

        processOrders(myMachine, orders);

        assert.deepStrictEqual(myMachine.checkInventory(), { water: 410, milk: 0, coffeeBeans: 30 }, "Assertion Error: Final inventory");
    }
    catch (error) {
        console.error(error.message);
    }
};

coffeeMachineTest();