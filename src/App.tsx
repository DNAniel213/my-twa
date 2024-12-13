import { useEffect } from 'react';
import './App.css';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useTonConnect } from './hooks/useTonConnect';
import { useCounterContract } from './hooks/useCounterContract';
import '@twa-dev/sdk';
import { Address, beginCell, toNano } from '@ton/ton';

function App() {
  const [tonConnectUI] = useTonConnectUI();
  const { connected } = useTonConnect();
  const { value, address, sendIncrement } = useCounterContract();

  const Wallet_DST = Address.parse("EQAXOOVp83WBZk_dTzip9ZlletOiSIcZ7aW2XqipkXHLzXq6"); //destination wallet
  const Wallet_SRC = Address.parse("UQDfOf0DC7glxpBtCWqqEW8Fb1Ct3R5Rcc5nf-ySZ72RUAgd"); //source wallet???
  const JettonAddress = "EQB-S6baB_rU4vgL4keS0jKVNY5rzUqtKkIxFAJx4N2EgYKy";
    
  async function wah() {
    const testBody = beginCell()
      .storeUint(0xf8a7ea5, 32)                 // jetton transfer op code
      .storeUint(0, 64)                         // query_id:uint64
      .storeCoins(1000000000)                   // amount:(VarUInteger 16) - Jetton amount for transfer (decimals = 6 - jUSDT, 9 - default)
      .storeAddress(Wallet_DST)                 // destination:MsgAddress
      .storeAddress(Wallet_SRC)                 // response_destination:MsgAddress
      .storeUint(0, 1)                          // custom_payload:(Maybe ^Cell)
      .storeCoins(toNano(0.05))                 // forward_ton_amount:(VarUInteger 16)
      .storeUint(0, 1)                          // forward_payload:(Either Cell ^Cell)
      .endCell();
  
    const testTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: JettonAddress, // sender jetton wallet
          amount: toNano("0.3") + "", // for commission fees, excess will be returned
          payload: testBody.toBoc().toString("base64") // payload with jetton transfer body
        }
      ]
    };

    tonConnectUI.sendTransaction(testTransaction);
  }

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      console.log("Event Received " + event.data.command + " " + event.data.incrementValue + "");
      console.log("Event origin: " + event.origin);
  
      if (event.data.command === "distributeToken") {
        console.log('distributeToken ' + event.data.incrementValue);

        const body = beginCell()
          .storeUint(0xf8a7ea5, 32)                 // jetton transfer op code
          .storeUint(0, 64)                         // query_id:uint64
          .storeCoins(event.data.incrementValue * 1000000000) // amount:(VarUInteger 16) - Jetton amount for transfer (decimals = 6 - jUSDT, 9 - default)
          .storeAddress(Wallet_DST)                 // destination:MsgAddress
          .storeAddress(Wallet_SRC)                 // response_destination:MsgAddress
          .storeUint(0, 1)                          // custom_payload:(Maybe ^Cell)
          .storeCoins(toNano(0.05))                 // forward_ton_amount:(VarUInteger 16)
          .storeUint(0, 1)                          // forward_payload:(Either Cell ^Cell)
          .endCell();

        const myTransaction = {
          validUntil: Math.floor(Date.now() / 1000) + 360,
          messages: [
            {
              address: JettonAddress, // sender jetton wallet
              amount: toNano("0.3") + "", // for commission fees, excess will be returned
              payload: body.toBoc().toString("base64") // payload with jetton transfer body
            }
          ]
        };

        tonConnectUI.sendTransaction(myTransaction);
      }
    };
  
    window.addEventListener("message", messageHandler);
  
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [sendIncrement]);

  return (
    <div className='App'>
      <div className="gameframe">
        <iframe className='gameframe' src="https://gamedevs.metaxar.io/blob/releases/WebGL/C5116F471C38D1EE/kisa_1_0_4/index.html" title="Iframe Example"></iframe>
      </div>

      <div className='Container'>
        <TonConnectButton />
        <b>This is a test contract that increments the contract's value when you send it some TON</b>

        <div className='Card'>
          <b>Contract Address</b>
          <div className='Hint'>{address?.slice(0, 30) + '...'}</div>
        </div>

        <div className='Card'>
          <b>Contract Current Value</b>
          <div>{value ?? 'Loading...'}</div>
        </div>
        <a
          className={`Button ${connected ? 'Active' : 'Disabled'}`}
          onClick={() => wah()}
        >Test Claim dToken</a>
      </div>
    </div>
  );
}

export default App;