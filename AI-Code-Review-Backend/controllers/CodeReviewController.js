import {
    codingOnlyPrompt,
    contextPrompt,
    initialPrompt,
    markdownPrompt,
    opt1Prompt,
    opt2Prompt,
    opt3Prompt,
    opt4Prompt
} from "../utils/prompt.js";
import {GoogleGenerativeAI} from "@google/generative-ai";
import { Ollama } from "ollama";
import { ZhipuAI } from "zhipuai-sdk-nodejs-v4";

import dotenv from "dotenv";

dotenv.config()

export const getResponseFromGemini = async (req, res, next) => {
    try {
        const {opt1, opt2, opt3, opt4, code, context} = req.body

        let prompt = initialPrompt
        if (opt1 === true) prompt += opt1Prompt
        if (opt2 === true) prompt += opt2Prompt
        if (opt3 === true) prompt += opt3Prompt
        if (opt4 === true) prompt += opt4Prompt
        if (context.trim() !== "") {
            prompt += contextPrompt
            prompt += context.trim()
        }
        prompt += markdownPrompt
        prompt += codingOnlyPrompt

        // ChatGLM
        const ai = new ZhipuAI();
        const data = await ai.createCompletions({
            model: "glm-4-flash",
            messages: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "user",
                    content: code.trim()
                }
            ],
            stream: false
        });
        console.log(data.choices[0].message.content)
        const text = data.choices[0].message.content;
        
        // Ollama
        // const ollama = new Ollama({host: "http://localhost:11434"});
        // const result = await ollama.chat({
        //     model: "llama3.1:8b",
        //     messages: [{role: "user", content: prompt},
        //         {role: "user", content: code.trim()}
        //      ]
        // });
        // console.log(result.response.text())
        
        // Gemini
        // const genAI = new GoogleGenerativeAI(process.env.API_KEY || '')
        // const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        // const result = await model.generateContent([prompt, code.trim()]);
        // const response = result.response;
        // const text = response.text();

        return res.status(200).json({response: text, success: true})
    } catch (e) {
        console.error("Response error: ", e)
        return res.status(500).json({message: "Unable to process your request!", success: false})
    }
}