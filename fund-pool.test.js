const anchor = require('@project-serum/anchor');
const { PublicKey, SystemProgram } = anchor.web3;

describe('fund-pool', () => {
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  // Load the program
  const program = anchor.workspace.FundPool;

  // Generate a new keypair for the fund pool account
  const fundPoolAccount = anchor.web3.Keypair.generate();

  // Define the admin wallet (provider.wallet is the default wallet)
  const admin = provider.wallet;

  it('Initializes the fund pool', async () => {
    // Initialize the fund pool
    await program.rpc.initialize({
      accounts: {
        fundPool: fundPoolAccount.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [fundPoolAccount],
    });

    // Fetch the fund pool account
    const pool = await program.account.fundPool.fetch(fundPoolAccount.publicKey);

    // Verify the pool state
    assert.equal(pool.admin.toString(), admin.publicKey.toString());
    assert.equal(pool.totalFunds.toNumber(), 0);
    assert.equal(pool.userShares.length, 0);
  });

  it('Deposits funds into the pool', async () => {
    const depositAmount = 1000; // Amount in lamports

    // Deposit funds into the pool
    await program.rpc.deposit(new anchor.BN(depositAmount), {
      accounts: {
        fundPool: fundPoolAccount.publicKey,
        user: admin.publicKey,
      },
    });

    // Fetch the fund pool account
    const pool = await program.account.fundPool.fetch(fundPoolAccount.publicKey);

    // Verify the pool state
    assert.equal(pool.totalFunds.toNumber(), depositAmount);
    assert.equal(pool.userShares.length, 1);
    assert.equal(pool.userShares[0][0].toString(), admin.publicKey.toString());
    assert.equal(pool.userShares[0][1].toNumber(), depositAmount);
  });

  it('Withdraws profits from the pool', async () => {
    // Withdraw profits from the pool
    await program.rpc.withdraw({
      accounts: {
        fundPool: fundPoolAccount.publicKey,
        admin: admin.publicKey,
      },
    });

    // Fetch the fund pool account
    const pool = await program.account.fundPool.fetch(fundPoolAccount.publicKey);

    // Verify the pool state
    assert.equal(pool.totalFunds.toNumber(), 0);
    assert.equal(pool.userShares.length, 1);
  });
});
