#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, BytesN, Env, String, Symbol};

#[contract]
pub struct Oss402Attestation;

#[contractimpl]
impl Oss402Attestation {
    /// Record a PASS-only maintainer attestation bound to a subject hash.
    pub fn attest(
        env: Env,
        issuer: Address,
        subject_hash: BytesN<32>,
        attestation_id: String,
    ) {
        issuer.require_auth();
        let key = (symbol_short!("subj"), subject_hash.clone());
        if env.storage().instance().has(&key) {
            panic!("subject already attested");
        }
        env.storage().instance().set(&key, &attestation_id);
        env.storage()
            .instance()
            .set(&(symbol_short!("iss"), subject_hash.clone()), &issuer);
        env.events().publish(
            (Symbol::new(&env, "attested"), subject_hash),
            attestation_id,
        );
    }

    pub fn get_attestation(env: Env, subject_hash: BytesN<32>) -> Option<String> {
        let key = (symbol_short!("subj"), subject_hash);
        env.storage().instance().get(&key)
    }

    pub fn get_issuer(env: Env, subject_hash: BytesN<32>) -> Option<Address> {
        let key = (symbol_short!("iss"), subject_hash);
        env.storage().instance().get(&key)
    }
}

mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, BytesN, Env, String};

    #[test]
    fn attest_and_read() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(Oss402Attestation, ());
        let client = Oss402AttestationClient::new(&env, &contract_id);
        let issuer = Address::generate(&env);
        let subject = BytesN::from_array(&env, &[7u8; 32]);
        let id = String::from_str(&env, "att_1");
        client.attest(&issuer, &subject, &id);
        assert_eq!(client.get_attestation(&subject), Some(id));
        assert_eq!(client.get_issuer(&subject), Some(issuer));
    }
}
