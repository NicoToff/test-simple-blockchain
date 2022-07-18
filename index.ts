import * as crypto from "crypto";

class Transaction {
    constructor(
        public amount: number,
        public payer: string, // Pub key
        public payee: string // Pub key
    ) {}
}

class Block {
    // A nonce is an arbitrary number that can be used just once in a cryptographic communication
    public nonce = Math.round(((Math.random() * Date.now() * 999999999) % (Math.random() * 99999)) * 9999999);

    constructor(
        public prevHash: string | null, // Previous block in the chain
        public transaction: Transaction, // Actual transaction made
        public timestamp: number = Date.now() // To arrange blocks in chronological order
    ) {}

    get hash(): string {
        const str: string = JSON.stringify(this);
        const hashingAlgo: crypto.Hash = crypto.createHash("SHA256");
        hashingAlgo.update(str); // Adds data to be hashed. This can be called as many times as needed.
        hashingAlgo.end(); // Signals that no more data will arrive
        const digest: string = hashingAlgo.digest("hex"); // Generates a digest based on the data received
        // No more data can be added/digestified at this point!
        return digest;
        /* This method chaining would work too */
        // return crypto.createHash("SHA256").update(str).end().digest("hex");
    }
}

class Chain {
    public static instance: Chain = new Chain(); // Singleton instance. There is only one blockchain.

    chain: Block[]; // The chain is basically an array of Blocks

    // The constructor creates the very first block in the chain, the "genesis" block
    constructor() {
        this.chain = [new Block(null, new Transaction(100, "genesis", "nicotoff"))];
    }

    get lastBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    addBlock(transaction: Transaction, senderPubKey: string, signature: Buffer) {
        const verifier: crypto.Verify = crypto.createVerify("SHA256");
        verifier.update(transaction.toString());

        const isValid: boolean = verifier.verify(senderPubKey, signature);

        if (isValid) {
            const newBlock: Block = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            console.log(transaction);
            this.chain.push(newBlock);
        }
    }

    mine(nonce: number): number {
        let solution: number = 1;
        console.log("⛏️ Mining...");

        while (true) {
            const hash: crypto.Hash = crypto.createHash("MD5");
            hash.update((nonce + solution).toString()).end();

            const attempt: string = hash.digest("hex");

            if (attempt.substring(0, 4) === "0000") {
                console.log(`Solved: ${solution}`);
                return solution;
            }

            solution++;
        }
    }
}

class Wallet {
    public pubKey: string;
    private privKey: string;

    constructor() {
        let keyPair: crypto.KeyPairSyncResult<string, string>;
        keyPair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
        this.privKey = keyPair.privateKey;
        this.pubKey = keyPair.publicKey;
    }

    sendMoney(amount: number, payeePubKey: string) {
        const transaction: Transaction = new Transaction(amount, this.pubKey, payeePubKey);

        const signingAlgo: crypto.Sign = crypto.createSign("SHA256");
        signingAlgo.update(transaction.toString()); // Adds data to be hashed. This can be called as many times as needed.
        signingAlgo.end(); // Signals that no more data will arrive

        const signature: Buffer = signingAlgo.sign(this.privKey);

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
