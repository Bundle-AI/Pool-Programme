use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum FundPoolError {
    #[error("Invalid admin")]
    InvalidAdmin,
    #[error("Insufficient funds")]
    InsufficientFunds,
}

impl From<FundPoolError> for ProgramError {
    fn from(e: FundPoolError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
