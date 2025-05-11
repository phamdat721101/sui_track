module badge_contract::badge_nft {
    // Import the sui::url module instead of destructuring to avoid alias issues.
    use sui::url;
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string;

    // Structure to store theme animal information.
    struct ThemeAnimal has copy, drop, store {
        id: string::String,
        name: string::String,
        image: url::Url,
        // Icon images stored as byte vectors.
        icon: vector<u8>,
        icon2: vector<u8>,
        level: u64,
        max_level: u64,
    }

    // Structure for the Project NFT that includes progress and theme animal metadata.
    struct ProjectNFT has key, store {
        id: UID,
        name: string::String,
        description: string::String,
        url: url::Url,
        // Progress percentage.
        progress: u64,
        // Current level of the project NFT.
        level: u64,
        max_level: u64,
        // Target and current transaction counts.
        target_transactions: u64,
        current_transactions: u64,
        // Theme animal metadata.
        theme_animal: ThemeAnimal,
    }

    // Event emitted when a Project NFT is minted.
    struct MintProjectNFTEvent has copy, drop {
        object_id: ID,
        creator: address,
        name: string::String,
    }

    // Event emitted when progress is updated.
    struct UpdateProgressEvent has copy, drop {
        object_id: ID,
        new_progress: u64,
        new_current_transactions: u64,
    }

    // Event emitted when a level up occurs.
    struct LevelUpEvent has copy, drop {
        object_id: ID,
        new_level: u64,
    }

    // Entry function to mint a new Project NFT with theme animal metadata.
    public entry fun mint_project_nft(
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,
        target_transactions: u64,
        // Theme animal parameters (passed as byte vectors for strings).
        theme_animal_id: vector<u8>,
        theme_animal_name: vector<u8>,
        theme_animal_image: vector<u8>,
        theme_animal_icon: vector<u8>,
        theme_animal_icon2: vector<u8>,
        theme_animal_level: u64,
        theme_animal_max_level: u64,
        ctx: &mut TxContext
    ) {
        let project_name = string::utf8(name);
        let project_description = string::utf8(description);
        // Fully qualify the URL creation call.
        let project_url = url::new_unsafe_from_bytes(url);

        let animal_id = string::utf8(theme_animal_id);
        let animal_name = string::utf8(theme_animal_name);
        let animal_image = url::new_unsafe_from_bytes(theme_animal_image);
        let animal_icon = theme_animal_icon;
        let animal_icon2 = theme_animal_icon2;

        let theme_animal = ThemeAnimal {
            id: animal_id,
            name: animal_name,
            image: animal_image,
            icon: animal_icon,
            icon2: animal_icon2,
            level: theme_animal_level,
            max_level: theme_animal_max_level,
        };

        let nft = ProjectNFT {
            id: sui::object::new(ctx),
            name: project_name,
            description: project_description,
            url: project_url,
            progress: 0,
            // Initial NFT level is set to 1.
            level: 1,
            // Maximum level is fixed at 5; adjust as needed.
            max_level: 5,
            target_transactions: target_transactions,
            current_transactions: 0,
            theme_animal: theme_animal,
        };

        let sender = sui::tx_context::sender(ctx);
        event::emit(MintProjectNFTEvent {
            object_id: sui::object::uid_to_inner(&nft.id),
            creator: sender,
            name: nft.name,
        });
        transfer::public_transfer(nft, sender);
    }

    // Entry function to update the description of a Project NFT.
    public entry fun update_description(nft: &mut ProjectNFT, new_description: vector<u8>) {
        nft.description = string::utf8(new_description);
    }

    // Entry function to update progress by adding additional transactions.
    // If the required number of transactions is met and the NFT is not at max level,
    // the NFT levels up.
    public entry fun update_progress(nft: &mut ProjectNFT, additional_transactions: u64, ctx: &mut TxContext) {
        nft.current_transactions = nft.current_transactions + additional_transactions;
        let new_progress = (nft.current_transactions * 100) / nft.target_transactions;
        nft.progress = new_progress;
        event::emit(UpdateProgressEvent {
            object_id: sui::object::uid_to_inner(&nft.id),
            new_progress: new_progress,
            new_current_transactions: nft.current_transactions,
        });
        // Check for level up conditions: if the required transactions are met and level is below max.
        let required = required_transactions(nft.target_transactions, nft.level, nft.max_level);
        if (nft.current_transactions >= required && nft.level < nft.max_level) {
            nft.level = nft.level + 1;
            event::emit(LevelUpEvent {
                object_id: sui::object::uid_to_inner(&nft.id),
                new_level: nft.level,
            });
        }
    }

    // Helper function to calculate the required transactions for a given level.
    fun required_transactions(target: u64, level: u64, max_level: u64): u64 {
        // Calculate required transactions using ceiling division.
        (target * level + max_level - 1) / max_level
    }

    // Entry function to burn (delete) a Project NFT.
    public entry fun burn(nft: ProjectNFT) {
        let ProjectNFT { id, .. } = nft;
        sui::object::delete(id);
    }

    // Getter function to retrieve the name of the Project NFT.
    public fun get_name(nft: &ProjectNFT): &string::String {
        &nft.name
    }

    // Getter function to retrieve the description of the Project NFT.
    public fun get_description(nft: &ProjectNFT): &string::String {
        &nft.description
    }

    // Getter function to retrieve the URL of the Project NFT.
    public fun get_url(nft: &ProjectNFT): &url::Url {
        &nft.url
    }

    // Getter function to retrieve the progress of the Project NFT.
    public fun get_progress(nft: &ProjectNFT): u64 {
        nft.progress
    }

    // Getter function to retrieve the level of the Project NFT.
    public fun get_level(nft: &ProjectNFT): u64 {
        nft.level
    }
}
