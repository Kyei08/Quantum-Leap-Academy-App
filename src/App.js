 import React, { useState } from 'react';

// Main App component for the education academy
const App = () => {
    // State variables to manage the application's data and UI
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [showCertificate, setShowCertificate] = useState(false);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // === START OF CRITICAL API KEY/URL DEFINITIONS ===

    // 1. Define apiKey ONCE at the top level of your component.
    // This is correct and should remain here.
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    // 2. DELETE THIS LINE if it exists here (at the top level of App component):
    // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // === END OF CRITICAL API KEY/URL DEFINITIONS ===


    /**
     * Handles changes to the topic input field.
     * @param {Object} e - The event object from the input change.
     */
    const handleTopicChange = (e) => {
        setTopic(e.target.value);
        setQuestions([]);
        setUserAnswers({});
        setScore(0);
        setShowCertificate(false);
        setErrorMessage('');
    };

    /**
     * Handles changes to the user's selected answer for a question.
     * @param {number} questionIndex - The index of the question.
     * @param {string} selectedOption - The option selected by the user.
     */
    const handleAnswerChange = (questionIndex, selectedOption) => {
        setUserAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionIndex]: selectedOption
        }));
    };

    /**
     * Generates test questions using the Gemini API.
     * It sends a prompt to the AI model and expects a JSON response
     * containing an array of questions, options, and the correct answer.
     */
    const generateTest = async () => {
        if (!topic.trim()) {
            setErrorMessage('Please enter a topic to generate a test.');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setQuestions([]); // Clear previous questions
        setUserAnswers({}); // Clear previous answers
        setScore(0);
        setShowCertificate(false);

        const prompt = `Generate a multiple-choice test with 5 questions about "${topic}". Each question should have 4 options (A, B, C, D) and indicate the correct answer. Provide the output in a JSON array format. Example: [{"question": "What is X?", "options": {"A": "Opt1", "B": "Opt2", "C": "Opt3", "D": "Opt4"}, "correctAnswer": "B"}]`;

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });

            const payload = {
                contents: chatHistory,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                "question": { "type": "STRING" },
                                "options": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "A": { "type": "STRING" },
                                        "B": { "type": "STRING" },
                                        "C": { "type": "STRING" },
                                        "D": { "type": "STRING" }
                                    },
                                    "required": ["A", "B", "C", "D"]
                                },
                                "correctAnswer": { "type": "STRING" }
                            },
                            "required": ["question", "options", "correctAnswer"]
                        }
                    }
                }
            };

            // === THIS IS WHERE apiUrl SHOULD BE DEFINED AND USED ===
            // It MUST be inside the generateTest function, not outside.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} - ${errorData.error.message || response.statusText}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const jsonString = result.candidates[0].content.parts[0].text;
                const parsedQuestions = JSON.parse(jsonString);
                setQuestions(parsedQuestions);
            } else {
                setErrorMessage('Failed to generate questions. Please try again.');
            }
        } catch (error) {
            console.error('Error generating test:', error);
            setErrorMessage(`Error generating test: ${error.message}. Please try a different topic or try again.`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Submits the test, calculates the score, and determines if a certificate should be shown.
     */
    const submitTest = () => {
        if (questions.length === 0) {
            setErrorMessage('Please generate a test first.');
            return;
        }

        let correctCount = 0;
        questions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                correctCount++;
            }
        });
        const calculatedScore = (correctCount / questions.length) * 100;
        setScore(calculatedScore);
        setShowCertificate(true);
    };

    /**
     * Handles the download of the certificate.
     * This is a simplified function that would typically generate a PDF or image.
     * For this example, it just shows an alert.
     */
    const downloadCertificate = () => {
        // In a real application, you would generate a PDF or image here.
        // For this environment, direct file download is complex.
        // We'll simulate it with a message.
        alert('Certificate download initiated! (In a real app, a file would download)');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-3xl transform transition-all duration-300 hover:scale-[1.01]">
                <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Emmanuel Education Academy
                    </span>
                </h1>

                {/* Topic Input Section */}
                <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
                    <label htmlFor="topic-input" className="block text-xl font-semibold text-gray-700 mb-3">
                        Enter Test Topic:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            id="topic-input"
                            type="text"
                            value={topic}
                            onChange={handleTopicChange}
                            placeholder="e.g., 'React Hooks', 'World War II', 'Quantum Physics'"
                            className="flex-grow p-4 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg text-gray-800 transition-all duration-200"
                        />
                        <button
                            onClick={generateTest}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? 'Generating...' : 'Generate New Test'}
                        </button>
                    </div>
                    {errorMessage && (
                        <p className="text-red-600 text-md mt-4 text-center">{errorMessage}</p>
                    )}
                </div>

                {/* Test Questions Section */}
                {questions.length > 0 && !showCertificate && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Test</h2>
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="mb-6 p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                <p className="text-lg font-semibold text-gray-900 mb-3">{qIndex + 1}. {q.question}</p>
                                <div className="space-y-2">
                                    {Object.entries(q.options).map(([optionKey, optionValue]) => (
                                        <label key={optionKey} className="flex items-center text-gray-700 cursor-pointer hover:bg-blue-50 p-2 rounded-md transition-colors duration-150">
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                value={optionKey}
                                                checked={userAnswers[qIndex] === optionKey}
                                                onChange={() => handleAnswerChange(qIndex, optionKey)}
                                                className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-3 text-base">{optionKey}. {optionValue}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={submitTest}
                                className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 text-lg"
                            >
                                Submit Test
                            </button>
                        </div>
                    </div>
                )}

                {/* Certificate Section */}
                {showCertificate && (
                    <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl shadow-inner border-4 border-yellow-300 text-center relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full bg-contain bg-no-repeat bg-center opacity-10" style={{ backgroundImage: "url('https://placehold.co/600x400/FFF8DC/DAA520?text=Certificate+Seal')" }}></div>
                        <div className="relative z-10">
                            <h2 className="text-5xl font-extrabold text-yellow-800 mb-4 font-serif">Certificate of Achievement</h2>
                            <p className="text-xl text-gray-700 mb-6">This certifies that</p>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Your Name"
                                className="text-4xl font-bold text-blue-700 border-b-2 border-blue-400 bg-transparent outline-none text-center mb-6 p-2 w-full max-w-sm mx-auto focus:border-blue-600 transition-colors duration-200"
                            />
                            <p className="text-xl text-gray-700 mb-4">has successfully completed the test on</p>
                            <p className="text-3xl font-semibold text-purple-700 mb-6">"{topic}"</p>
                            <p className="text-2xl font-bold text-gray-800 mb-8">
                                with a score of <span className="text-green-600">{score.toFixed(2)}%</span>
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => {
                                        setShowCertificate(false);
                                        setQuestions([]);
                                        setUserAnswers({});
                                        setScore(0);
                                        setTopic('');
                                        setUserName('');
                                    }}
                                    className="bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-400 transition-all duration-200 transform hover:scale-105 text-lg"
                                >
                                    Take Another Test
                                </button>
                                <button
                                    onClick={downloadCertificate}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 text-lg"
                                >
                                    Download Certificate
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;