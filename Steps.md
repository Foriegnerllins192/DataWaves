I already started building a Ghana mobile data–selling website that lets users buy and top up data bundles for MTN, Vodafone, and AirtelTigo.
The structure and basic pages are there, but some backend and logic parts are incomplete.
Go through my existing code, find what’s missing, and complete the project end-to-end so it works fully.

🔧 What I Need Qoder To Do

Check the current project

Identify all unfinished functions, empty endpoints, or UI buttons that don’t connect yet.

Don’t rebuild what’s done — only complete what’s missing.

Complete the payment → delivery flow

Make sure payments via Paystack (or Flutterwave) actually trigger the Aggregator API call (Reloadly, Africa’s Talking, or Korba).

Use webhooks to verify payments securely.

After payment success:

Call aggregator API to top up data.

Log transaction details (phone, network, bundle, amount, status).

Send success response and message (SMS or email).

Fix or complete the webhook logic

Verify webhook signature.

Handle duplicate events safely (idempotency).

Store both payment and API response in the DB.

Finish transaction and wallet management

Implement logic for:

User wallet or pay-per-use flow.

Admin wallet balance (aggregator funds).

Alert admin if aggregator wallet runs low.

Complete Admin Dashboard

Show:

Total transactions (today, week, month)

Success / failed top-ups

User list with verification status

Aggregator wallet balance

Add ability to resend failed top-ups manually.

Integrate aggregator API completely

Implement:

topup(phone, network, bundleCode)

checkBalance()

getBundles(network)

Make sure these routes return proper responses to the frontend.

Pricing & markup system

Make sure each network’s bundle has a set markup.

Calculate customer price = base price + margin.

Store and update these in the DB or admin panel.

Validation & security

Validate Ghana phone numbers (regex).

Verify all webhooks.

Hide all API keys in .env.

Prevent duplicate or failed transactions from being charged again.

Testing & logs

Test payment flow in sandbox mode (Paystack + Aggregator).

Add logs for:

Payment webhook

Aggregator request & response

Errors and retries

Final polish

Make sure the website is fully responsive and user-friendly.

Ensure transaction history displays correctly for each user.

Test on all networks (MTN, Vodafone, AirtelTigo) in test mode.

✅ Goal for Qoder

Finish the website so that it can:

Accept and verify payments from Ghana users.

Automatically deliver the correct mobile data bundle.

Record all transactions clearly in the database.

Allow admin to track users, balance, and top-up history.

Make the final product stable, secure, and ready for deployment.