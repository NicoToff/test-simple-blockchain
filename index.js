"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transaction {
    constructor(amount, payer, // Pub key
    payee // Pub key
    ) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    toString() {
        return JSON.stringify(this);
    }
}
class Block {
    constructor() { }
}
