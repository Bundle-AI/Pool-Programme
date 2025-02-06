import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, Provider } from '@project-serum/anchor';

const FundPool = () => {
  const depositFunds = async () => {
    // Logic to deposit funds
  };

  return (
    <div>
      <button onClick={depositFunds}>Deposit Funds</button>
    </div>
  );
};

export default FundPool;
