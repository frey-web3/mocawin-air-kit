# Prediction Market Demo: Powered by Air Kit

A decentralized prediction market demo showcasing seamless cross-platform user authentication and a unique, rewarding **Winpoint (WP)** system integrated via the MOCA Network's **Air Kit**.

## ✨ Key Features & Unique Selling Proposition (USP)

This demo highlights a novel approach to user engagement and digital ownership in the prediction market space, leveraging the power of Air Kit for a superior user experience.

### 1. 🌐 Air Kit: Seamless, Cross-Platform Login

The core of our platform relies on **Air Kit** for user authentication, providing a universal, non-custodial login solution.

* **Universal Credentials:** Users log in using their Air Kit-linked credentials, ensuring a consistent identity across all connected platforms.
* **Winpoint (WP) Utility:** The user's accumulated **Winpoint (WP)** data is tied to their Air Kit identity, making it inherently cross-platform and usable for:
    * **Credentials/Status**
    * **Airdrops**
    * **Rewards & Loyalty**

### 2. 🏆 The Winpoint (WP) Advantage: Guaranteed Reward

We are redefining the prediction market by guaranteeing a reward for participation, regardless of the outcome.

* **Guaranteed Winpoint:** Every resolved prediction, whether you **win or lose** your trade, grants you a baseline amount of **Winpoint (WP)**. This unique mechanism encourages active participation by reducing the fear of loss.
* **Loyalty Utility:** WP is a verifiable measure of loyalty and activity that qualifies users for future rewards and incentives.

### 3. ⚡ Exclusive Air Kit Login Bonus

To incentivize the use of the Air Kit login solution, we offer an immediate benefit:

* **+10% WP Bonus:** Users who log in via **Air Kit** and successfully claim a resolved prediction will automatically receive a **10% bonus on their earned Winpoint (WP)**. This bonus is prominently displayed in the claim modal (`ClaimCard.tsx`).

***

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript / React
* **Styling:** Tailwind CSS
* **Authentication & Identity:** `@mocanetwork/airkit`

***

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone [YOUR_REPO_URL]
    cd mocawin-air-kit
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Configure Air Kit Environment Variable:
    Create a file named `.env.local` in the root directory and set your Air Kit Partner ID. This is required for the `AirService` instance.

    ```
    # Obtain your Partner ID from the MOCA Network developer portal
    NEXT_PUBLIC_PARTNER_ID="YOUR_PARTNER_ID" 
    ```

4.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application. Click **"Login to Trade"** on any market to initiate the **Air Kit** authentication flow.