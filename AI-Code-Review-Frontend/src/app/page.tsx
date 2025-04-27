"use client"
import Head from "next/head";
import React, {useEffect, useRef, useState} from "react";
import dynamic from "next/dynamic";
import CheckBox from "@/app/components/CheckBox";
import Markdown from "react-markdown";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {vscDarkPlus} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {saveAs} from 'file-saver';
import posthog from "posthog-js";
import axios from "axios";

const CodeEditor = dynamic(() => import('@/app/components/CodeEditor'), {ssr: false});

export default function Home() {
    posthog.capture('$pageview');
    const editorRef = useRef<any>(null);
    const [language, setLanguage] = useState<string>('javascript');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [codeContext, setCodeContext] = useState<string>('');
    const [response, setResponse] = useState<string>('');
    const [checkBoxStates, setCheckBoxStates] = useState({
        opt1: true,
        opt2: true,
        opt3: true,
        opt4: true,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleEditorMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.target.value);
        posthog.capture('language_change', {language: event.target.value});
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value, checked} = event.target;
        setCheckBoxStates((prevStates) => ({
            ...prevStates,
            [value]: checked,
        }));
        posthog.capture('checkbox_change', {option: value, checked});
    };

    const handleScrollToBottom = () => {
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    };

    const handleReviewCode = async () => {
        if (editorRef.current) {
            const code = editorRef.current.getValue();
            if (code.trim() !== "") {
                setError("")
                setLoading(true)

                const requestBody = {
                    opt1: checkBoxStates.opt1,
                    opt2: checkBoxStates.opt2,
                    opt3: checkBoxStates.opt3,
                    opt4: checkBoxStates.opt4,
                    code: code.trim(),
                    context: codeContext.trim()
                }

                posthog.capture('review_code');

                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_SERVER_URL_PROD || '', requestBody)
                    setResponse(response.data.response)
                    setIsModalOpen(true)
                    posthog.capture('code_reviewed', {response: response.data.response});
                } catch (e) {
                    console.error("Request error: ", e)
                    setError("Cannot process your request!")
                    posthog.capture('review_code_error', {error: e});
                } finally {
                    setLoading(false)
                }
            } else {
                setError("Please enter your code")
            }
        }
    };

    const handleDownloadResponseAsMarkdown = () => {
        try {
            const blob = new Blob([response], {type: 'text/markdown;charset=utf-8'});
            saveAs(blob, 'code_review_response.md');
            posthog.capture('response_downloaded');
        } catch (e) {
            console.error("Download error: ", e)
            posthog.capture('response_download_error', {error: e});
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Head>
                <title>AI Code Review</title>
                <meta name="description" content="AI Code Review"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className="flex flex-1 bg-gray-900 flex-col md:flex-row">
                <section className="w-full md:w-3/5 p-6">
                    <div className="mb-4">
                        {isMobile && (
                            <h1 className={"font-bold text-4xl mb-6"}>
                                AI Code Reviewer
                            </h1>
                        )}
                        <label
                            htmlFor="language"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Select Language
                        </label>
                        <select
                            id="language"
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                            <option value="go">Go</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <CodeEditor
                            onMount={handleEditorMount}
                            defaultLanguage={language}
                            path={language}
                        />
                    </div>
                </section>

                <section className="w-full md:w-2/5 p-6">
                    {!isMobile && (
                        <div className="flex-row mt-6">
                            <h1 className={"font-bold text-4xl"}>
                                AI Code Reviewer
                            </h1>
                        </div>
                    )}
                    <div className={"flex-col mt-6 mb-6"}>
                        <CheckBox
                            checked={checkBoxStates.opt1}
                            value={"opt1"}
                            label={"Analyse the code for logical flaws and potential security vulnerabilities"}
                            onChange={handleCheckboxChange}
                        />
                        <CheckBox
                            checked={checkBoxStates.opt2}
                            value={"opt2"}
                            label={"Provide a comprehensive list of recommendations for improvement"}
                            onChange={handleCheckboxChange}
                        />
                        <CheckBox
                            checked={checkBoxStates.opt3}
                            value={"opt3"}
                            label={"Provide edge cases or scenarios where the code might fail"}
                            onChange={handleCheckboxChange}
                        />
                        <CheckBox
                            checked={checkBoxStates.opt4}
                            value={"opt4"}
                            label={"Rewrite the code based on your review and recommendations"}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="large-input"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Any additional information regarding the code you would like to provide?
                        </label>
                        <textarea
                            id="large-input"
                            maxLength={512}
                            rows={8}
                            value={codeContext}
                            onChange={(event) => setCodeContext(event.target.value)}
                            className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <label
                            htmlFor="large-input"
                            className="block mt-2 text-end text-xs font-light text-gray-900 dark:text-gray-300"
                        >
                            {codeContext.length} / 512
                        </label>
                    </div>
                    <div className={"flex-1 flex-row flex items-center mb-4"}>
                        <button
                            disabled={loading}
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
                            onClick={() => handleReviewCode()}
                        >
                            {loading && (
                                <svg aria-hidden="true" role="status"
                                     className="inline w-4 h-4 me-3 text-white animate-spin"
                                     viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="#E5E7EB"/>
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentColor"/>
                                </svg>
                            )}
                            {loading ? 'Loading...' : 'Review My Code'}
                        </button>
                        {error.trim() !== "" && (
                            <label className="block ms-4 text-sm font-medium text-red-600">
                                {error}
                            </label>
                        )}
                    </div>
                </section>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        style={{backgroundColor: "#1E1E1E"}}
                        className="p-4 rounded-lg shadow-lg w-11/12 h-5/6 max-w-4xl overflow-y-auto"
                    >
                        <div className={"flex-1 flex-row flex justify-between items-center mb-4"}>
                            <h2 className="text-xl font-semibold text-white">Review</h2>
                            <button
                                type="button"
                                className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1 text-center me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                        <Markdown
                            className={"mt-4 mb-4"}
                            children={response}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code(props) {
                                    const {node, className, children, ...rest} = props
                                    const match = /language-(\w+)/.exec(className || '')
                                    return match ? (
                                        <SyntaxHighlighter
                                            PreTag="div"
                                            children={String(children).replace(/\n$/, '')}
                                            language={match[1]}
                                            wrapLongLines={true}
                                            style={vscDarkPlus}
                                        />
                                    ) : (
                                        <code {...rest} className={className}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
                            onClick={() => handleDownloadResponseAsMarkdown()}
                        >
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                 viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"/>
                            </svg>
                            Download Response
                        </button>
                    </div>
                </div>
            )}

            {isMobile && (
                <button
                    onClick={handleScrollToBottom}
                    className="fixed bottom-4 right-4 bg-blue-700 text-white rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 19V5m0 14-4-4m4 4 4-4"/>
                    </svg>
                </button>
            )}
        </div>
    );
}
