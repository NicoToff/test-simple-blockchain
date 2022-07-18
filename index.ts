import * as crypto from "crypto";

class Transaction {
    constructor(
        public amount: number,
        public payer: string, // Pub key
        public payee: string // Pub key
    ) {}
    toString() {
        return JSON.stringify(this);
    }
}

class Block {
    constructor() {}
}
