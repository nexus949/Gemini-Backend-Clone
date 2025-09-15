import userModel from "../../models/user.model.js";
import { stripe } from "../../../../config/config.js";
import { config } from "../../../../config/config.js";

export async function subscribeToPro(req, res) {
    try {
        const phone = req.user.phone;
        if(!phone)
            return res.status(404).json({ message: "No valid user found !" });

        //create a stripe checkout session.
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: config.PRO_PRICE_ID,
                    quantity: 1,
                },
            ],
            //placeholder for success and cancel url
            success_url: "https://example.com/success",
            cancel_url: "https://example.com/cancel",
            metadata: {
                phone: phone
            }
        });

        res.status(200).json({ url: session.url });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function stripeWebhook(req, res) {
    try {
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SIGNING_SECRET);
        }
        catch (error) {
            console.log("Stripe Signature Verification Error: ", error);
            return res.status(400).json({ message: "Invalid payment Signature, Payment Failed !" })
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const phone = session.metadata.phone;

            await userModel.update(
                {
                    subscriptionTier: "Pro"
                },
                { where: { phone: phone } }
            )

            console.log("Payment successful for customer with phone number: ", phone);
        }
        else{
            return res.status(400).json({ message: "Payment Failed !" });
        }

        res.status(200).json({ message: "Payment Successful !" });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function getSubscriptionStatus(req, res) {
    try {
        const phone = req.user.phone;
        if(!phone)
            return res.status(404).json({ message: "No valid user found !" });

        const user = await userModel.findOne({ where : { phone: phone }});

        res.status(200).json({
            phone: user.phone,
            subscription_tier: user.subscriptionTier
        });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}
