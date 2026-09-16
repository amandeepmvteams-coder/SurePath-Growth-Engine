import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function test() {
    try {
        const response =
            await client.chat.completions.create({
                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "user",
                        content:
                            "Reply with exactly: Groq connection successful",
                    },
                ],

                temperature: 0,
            });

        console.log(
            response.choices[0]?.message?.content
        );

    } catch (error) {

        console.error(
            "Groq test failed:",
            error
        );
    }
}

test();