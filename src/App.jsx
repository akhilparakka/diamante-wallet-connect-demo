import { useState } from "react";
import "./App.css";
import {
  Keypair,
  Horizon,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
} from "diamante-sdk-js";

function App() {
  // State variables to manage wallet public key, image, name, progress, and error messages
  const [publicKey, setPublicKey] = useState("");
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  // Handler for connecting to the wallet
  const handleClick = () => {
    window.diam.connect().then((res) => {
      setPublicKey(res.message[0]);
    });
  };

  // Handler for image file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handler for name input change
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // Handler for minting the asset
  const handleMint = async () => {
    setProgress("Minting...");
    setError("");
    try {
      const server = new Horizon.Server("https://diamtestnet.diamcircle.io");
      const sourceAccount = await server.loadAccount(publicKey);

      // Build a transaction for payment operation
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination:
              "GC6USVHPMPVDRJDQQNCANUTMFGWRYKH53V232HS4FJWM4IJDYVB3SMNB",
            asset: Asset.native(),
            amount: "2",
          })
        )
        .setTimeout(0)
        .build();

      const xdr = transaction.toXDR("base64");

      // Sign the transaction using the wallet
      const resp = await window.diam.sign(xdr, true, Networks.TESTNET);

      if (resp.response.status === 200) {
        const issuerKeypair = Keypair.random();

        let headersList = {
          Accept: "*/*",
        };

        // Fund the issuer account
        let response = await fetch(
          `https://friendbot.diamcircle.io/?addr=${issuerKeypair.publicKey()}`,
          {
            method: "GET",
            headers: headersList,
          }
        );

        setProgress("Funding issuer account!");
        if (response.status === 200) {
          // Create asset and issue trustline
          setProgress(`Creating asset ${name}`);
          const asset = new Asset(name, issuerKeypair.publicKey());
          setProgress(`Issuing trustline to ${publicKey} for asset ${name}`);
          const receiverAddress = await server.loadAccount(publicKey);

          const transaction = new TransactionBuilder(receiverAddress, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
          })
            .addOperation(Operation.changeTrust({ asset }))
            .setTimeout(0)
            .build();

          const xdr = transaction.toXDR("base64");
          const resp = await window.diam.sign(xdr, true, Networks.TESTNET);

          if (resp.response.status === 200) {
            // Issue the asset to the public key
            setProgress("Issuing Asset");
            const account = await server.loadAccount(issuerKeypair.publicKey());

            const transaction = new TransactionBuilder(account, {
              fee: BASE_FEE,
              networkPassphrase: "Diamante Testnet",
            })
              .addOperation(
                Operation.payment({
                  destination: publicKey,
                  asset,
                  amount: "1000",
                })
              )
              .setTimeout(100)
              .build();

            transaction.sign(issuerKeypair);
            const submitResp = await server.submitTransaction(transaction);
            if (submitResp.successful === true) {
              // Lock the issuer account
              setProgress("Locking issuer!");

              const lockTransaction = new TransactionBuilder(account, {
                fee: BASE_FEE,
                networkPassphrase: "Diamante Testnet",
              })
                .addOperation(
                  Operation.setOptions({
                    masterWeight: 0,
                  })
                )
                .setTimeout(100)
                .build();

              lockTransaction.sign(issuerKeypair);
              const finalTx = await server.submitTransaction(lockTransaction);
              console.log(finalTx);
              setProgress("Done");
            } else {
              setError("Issuing asset failed!");
            }
          } else {
            setError("Error creating trustline!");
          }
        } else {
          setError("Error funding issuer account!");
        }
      } else {
        setError("Error signing transaction!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Check if the mint button should be active
  const isMintButtonActive = publicKey && image && name;

  return (
    <div className="App">
      <button className="connect-wallet-button" onClick={handleClick}>
        {publicKey
          ? `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`
          : "Connect Wallet"}
      </button>
      {publicKey ? (
        <div className="image-upload-container">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <input
            type="text"
            placeholder="Specify the name of the image"
            value={name}
            onChange={handleNameChange}
          />
        </div>
      ) : (
        <div className="no-wallet-message">No wallet connected</div>
      )}
      {isMintButtonActive && (
        <button className="mint-button" onClick={handleMint}>
          Mint
        </button>
      )}
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        progress && <div className="progress-message">{progress}</div>
      )}
    </div>
  );
}

export default App;
