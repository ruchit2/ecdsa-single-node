import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import TestAccounts from "./TestAccounts";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const privateKeyValue = evt.target.value;
    setPrivateKey(privateKeyValue);
    try {
      const address = toHex(secp256k1.getPublicKey(privateKeyValue));
      setAddress(address);
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } catch (error) {
      console.log(error);
      setAddress("");
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <TestAccounts />
      <h1>Your Wallet</h1>

      <label>
        Private key hash
        <input
          placeholder="Type private key hash"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <label>
        Address
        <input value={address} disabled></input>
      </label>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
