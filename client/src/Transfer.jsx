import { useState } from "react";
import server from "./server";
import { secp256k1} from "ethereum-cryptography/secp256k1"
import {utf8ToBytes} from "ethereum-cryptography/utils"
import { keccak256} from "ethereum-cryptography/keccak"

function Transfer({ setBalance, privateKey, address }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const signature = await getSign(sendAmount + recipient, privateKey)
      const {
        data: { balance },
      } = await server.post(`send`, {
        amount: parseInt(sendAmount),
        recipient: recipient,
        signature: {
          r: signature.r.toString(),
          s: signature.s.toString(),
          recovery: signature.recovery,
        },
        publicKey: address,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  async function getSign(message, privateKey){
    const sig =  secp256k1.sign(
      hashMessage(message),
      privateKey,
    );
    return sig
  }

  function hashMessage(message) {
    const bytes = utf8ToBytes(message);
    const hash = keccak256(bytes);
    return hash;
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
