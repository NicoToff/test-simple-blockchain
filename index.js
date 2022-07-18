"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
}
class Block {
    constructor(prevHash, transaction, timestamp = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.timestamp = timestamp;
        this.nonce = Math.round(((Math.random() * Date.now() * 999999999) % (Math.random() * 99999)) * 9999999);
    }
    get hash() {
        const str = JSON.stringify(this);
        const hashingAlgo = crypto.createHash("SHA256");
        hashingAlgo.update(str);
        hashingAlgo.end();
        const digest = hashingAlgo.digest("hex");
        return digest;
    }
}
class Chain {
    constructor() {
        this.chain = [new Block(null, new Transaction(100, "genesis", "nicotoff"))];
    }
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    addBlock(transaction, senderPubKey, signature) {
        const verifier = crypto.createVerify("SHA256");
        verifier.update(transaction.toString());
        const isValid = verifier.verify(senderPubKey, signature);
        if (isValid) {
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            console.log(transaction);
            this.chain.push(newBlock);
        }
    }
    mine(nonce) {
        let solution = 1;
        console.log("⛏️ Mining...");
        while (true) {
            const hash = crypto.createHash("MD5");
            hash.update((nonce + solution).toString()).end();
            const attempt = hash.digest("hex");
            if (attempt.substring(0, 4) === "0000") {
                console.log(`Solved: ${solution}`);
                return solution;
            }
            solution++;
        }
    }
}
Chain.instance = new Chain();
class Wallet {
    constructor() {
        let keyPair;
        keyPair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
        this.privKey = keyPair.privateKey;
        this.pubKey = keyPair.publicKey;
    }
    sendMoney(amount, payeePubKey) {
        const transaction = new Transaction(amount, this.pubKey, payeePubKey);
        const signingAlgo = crypto.createSign("SHA256");
        signingAlgo.update(transaction.toString());
        signingAlgo.end();
        const signature = signingAlgo.sign(this.privKey);
        Chain.instance.addBlock(transaction, this.pubKey, signature);
    }
    toString() {
        return this.pubKey;
    }
}
const nicotoff = new Wallet();
const satoshi = new Wallet();
const alice = new Wallet();
satoshi.sendMoney(50, nicotoff.pubKey);
nicotoff.sendMoney(25, alice.pubKey);
alice.sendMoney(3, satoshi.pubKey);
