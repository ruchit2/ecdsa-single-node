const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes } = require("ethereum-cryptography/utils")
const { keccak256 } = require("ethereum-cryptography/keccak")

app.use(cors());
app.use(express.json());

const balances = {
  "039b166e2b1459c59b46ed99cb9949f1a27521d943f22ed802aeb87f20b819584f": 100,
  "0325f42ada3f5da804e23fbb974d5f7fe2ff4a25dec5f20b359cd9dcc3cfbce107": 50,
  "02a6391ca2c06bc8bbf41fd56b80f7d4b7d5d0e26f032aa37ba906f76428f9c5f1": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature: _signature, recipient, amount, publicKey } = req.body;

  const signature = {
    r: BigInt(_signature.r),
    s: BigInt(_signature.s),
    recovery: _signature.recovery,
  };
  if(!secp.secp256k1.verify(signature, hashMessage(amount + recipient), publicKey)){
    res.status(400).send({ message: "Invalid transaction" });
  }else{
    const sender = publicKey
    setInitialBalance(sender);
    setInitialBalance(recipient);
  
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }

});

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  const hash = keccak256(bytes);
  return hash;
}

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
