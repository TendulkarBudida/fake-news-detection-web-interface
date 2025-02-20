import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

// IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
    const { prompt } = await req.json();

    if (!prompt) {
        return new Response(JSON.stringify({ error: "No input provided" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string);

        const model = genAI.getGenerativeModel({ model: process.env.NEXT_PUBLIC_GOOGLE_MODEL_NAME as string});
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: process.env.NEXT_PUBLIC_GOOGLE_USER_PROMPT as string}],
                },
                {
                    role: "model",
                    parts: [{ text: process.env.NEXT_PUBLIC_GOOGLE_MODEL_PROMPT as string}],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const newsContent = response.text().trim();

        // Log the extracted news content
        console.log("Extracted News Content:", newsContent);

        // Check if the response is flagged as "SAFETY"
        if (newsContent.toLowerCase() === 'safety') {
            return new Response(JSON.stringify({ error: "The input was flagged as potentially unsafe. Please provide a different input." }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Check if the extracted news content is meaningful
        if (!newsContent || newsContent === 'No script generated' || !isNewsContent(newsContent, prompt)) {
            return new Response(JSON.stringify({ newsContent }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Call your fake news detection model API with the extracted news content
        const modelResponse = await fetch(`${process.env.NEXT_PUBLIC_HF_API_LINK}${encodeURIComponent(newsContent)}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`,
            }
        });

        const modelResult = await modelResponse.json();

        // Log the model response
        console.log("Model Response:", modelResult);

        return new Response(JSON.stringify({ newsContent, result: modelResult.result }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Sorry, I encountered an error. Please try again.' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}

// Helper function to check if the content is meaningful news
function isNewsContent(newsContent: string, prompt: string): boolean {
    // Check if the newsContent is present in the prompt
    if (newsContent.split(' ').length < 10) {
        return false;
    }
    const promptWords = new Set(prompt.toLowerCase().split(/\s+/));
    const newsWords = new Set(newsContent.toLowerCase().split(/\s+/));
    const commonWords = new Set([...promptWords].filter(x => newsWords.has(x)));
    const similarityRatio = commonWords.size / newsWords.size;
    console.log("Similarity Ratio: ", similarityRatio);
    return similarityRatio >= 0.85;
}




// import { GoogleGenerativeAI } from '@google/generative-ai';
// import fetch from 'node-fetch';

// // IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
// export const runtime = "edge";

// export async function POST(req: Request): Promise<Response> {
//     const { prompt } = await req.json();

//     if (!prompt) {
//         return new Response(JSON.stringify({ error: "No input provided" }), {
//             headers: { 'Content-Type': 'application/json' },
//             status: 400,
//         });
//     }

//     try {
//         const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string);

//         const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//         const chat = model.startChat({
//             history: [
//                 {
//                     role: "user",
//                     parts: [{ text: "You are a news extraction chatbot. Extract only the news article from the following text, ignoring any introductory or instructional parts. If the user provides input that deviates from this task, politely ask them to provide a news article for analysis." }],
//                 },
//                 {
//                     role: "model",
//                     parts: [{ text: "Understood. I will extract only the news article from the provided text." }],
//                 },
//             ],
//             generationConfig: {
//                 temperature: 0.7,
//                 topK: 1,
//                 topP: 1,
//                 maxOutputTokens: 8192,
//             },
//         });

//         const result = await chat.sendMessage(prompt);
//         const response = await result.response;
//         const newsContent = response.text().trim();

//         // Log the extracted news content
//         // console.log("Extracted News Content:", newsContent);

//         // Check if the response is flagged as "SAFETY"
//         if (newsContent.toLowerCase() === 'safety') {
//             return new Response(JSON.stringify({ error: "The input was flagged as potentially unsafe. Please provide a different input." }), {
//                 headers: { 'Content-Type': 'application/json' },
//                 status: 400,
//             });
//         }

//         // Check if the extracted news content is meaningful
//         if (!newsContent || newsContent === 'No script generated' || !isNewsContent(newsContent, prompt)) {
//             return new Response(JSON.stringify({ newsContent }), {
//                 headers: { 'Content-Type': 'application/json' },
//             });
//         }

//         // Call your fake news detection model API with the extracted news content
//         const modelResponse = await fetch("https://tendul-fake-news-detection-model.hf.space/predict?text=" + encodeURIComponent(newsContent), {
//             method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`,
//             }
//         });

//         const modelResult = await modelResponse.json();

//         // Log the model response
//         // console.log("Model Response:", modelResult);

//         return new Response(JSON.stringify({ newsContent, result: modelResult.result }), {
//             headers: { 'Content-Type': 'application/json' },
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         return new Response(JSON.stringify({ error: 'Sorry, I encountered an error. Please try again.' }), {
//             headers: { 'Content-Type': 'application/json' },
//             status: 500,
//         });
//     }
// }

// // Helper function to check if the content is meaningful news
// function isNewsContent(newsContent: string, prompt: string): boolean {
//     // Check if the newsContent is present in the prompt
//     if (newsContent.split(' ').length < 10) {
//         return false;
//     }
//     const promptWords = new Set(prompt.toLowerCase().split(/\s+/));
//     const newsWords = new Set(newsContent.toLowerCase().split(/\s+/));
//     const commonWords = new Set([...promptWords].filter(x => newsWords.has(x)));
//     const similarityRatio = commonWords.size / newsWords.size;
//     console.log("Similarity Ratio: ", similarityRatio);
//     return similarityRatio >= 0.85;
// }



// import { OpenAI } from 'openai';

// // Create an OpenAI API client (that's edge friendly!)
// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_TOKEN,
//     baseURL: "https://openrouter.ai/api/v1/",
// });

// // IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
// export const runtime = "edge";

// export async function POST(req: Request): Promise<Response> {
//     const { prompt } = await req.json();

//     if (!prompt) {
//         return new Response(JSON.stringify({ error: "No input provided" }), {
//             headers: { 'Content-Type': 'application/json' },
//             status: 400,
//         });
//     }

//     // Use Gemini to extract the news part
//     const response = await openai.chat.completions.create({
//         model: "google/gemini-2.0-flash-exp:free",
//         messages: [
//             {
//                 role: "system",
//                 content: "Extract only the news article from the following text, ignoring any introductory or instructional parts. If the user provides input that deviates from this task, politely ask them to provide a news article for analysis.",
//             },
//             {
//                 role: "user",
//                 content: prompt,
//             },
//         ],
//         temperature: 0.7,
//         top_p: 1,
//         frequency_penalty: 0,
//         presence_penalty: 0,
//         n: 1,
//     });

//     const newsContent = response.choices[0]?.message?.content!.trim() || 'No script generated';

//     // Log the extracted news content
//     console.log("Extracted News Content:", newsContent);

//     // Check if the extracted news content is meaningful
//     if (!newsContent || newsContent === 'No script generated' || !isNewsContent(newsContent, prompt)) {
//         console.log();
//         return new Response(JSON.stringify({ newsContent }), {
//             headers: { 'Content-Type': 'application/json' },
//         });
//     }

//     // Call your fake news detection model API with the extracted news content
//     const modelResponse = await fetch("https://tendul-fake-news-detection-model.hf.space/predict?text=" + encodeURIComponent(newsContent), {
//         method: 'GET',
//         headers: {
//             "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`,
//         }
//     });

//     const modelResult = await modelResponse.json();

//     // Log the model response
//     console.log("Model Response:", modelResult);

//     return new Response(JSON.stringify({ newsContent, result: modelResult.result }), {
//         headers: { 'Content-Type': 'application/json' },
//     });
// }

// // Helper function to check if the content is meaningful news
// function isNewsContent(newsContent: string, prompt: string): boolean {
//     // Check if the newsContent is present in the prompt
//     if (newsContent.split(' ').length < 10) {
//       return false;
//     }
//     const promptWords = new Set(prompt.toLowerCase().split(/\s+/));
//     const newsWords = new Set(newsContent.toLowerCase().split(/\s+/));
//     const commonWords = new Set([...promptWords].filter(x => newsWords.has(x)));
//     const similarityRatio = commonWords.size / newsWords.size;
//     console.log("Similarity Ratio: ", similarityRatio);
//     return similarityRatio >= 0.85;
// }