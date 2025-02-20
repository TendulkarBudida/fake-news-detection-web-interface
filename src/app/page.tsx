'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

import {
  ExclamationCircleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Track whether the user has submitted their *first* prompt.
  const [firstPromptSubmitted, setFirstPromptSubmitted] = useState(false);

  // Submit the prompt
  const generateScript = async () => {
    if (!prompt.trim()) {
      setError('Please provide input text.');
      return;
    }
    if (!firstPromptSubmitted) {
      setFirstPromptSubmitted(true);
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setNewsContent(data.newsContent);
        setResult(data.result);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`An error occurred: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex h-screen flex-col ${
        isDarkMode
          ? 'bg-[var(--color-dark-blue)] text-[var(--color-white)]'
          : 'bg-light-blue-gradient text-[var(--color-black)]'
      }`}
    >
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center space-x-1">
          <h1 className="text-2xl font-semibold ">Fake News Detection</h1>
        </div>
        <div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            // className="p-2 rounded-lg hover:bg-[var(--color-hover-border-dark)]"
            className={`p-2 rounded-lg ${
              isDarkMode
              ? 'hover:bg-[var(--color-hover-border-dark)]'
              : 'hover:bg-[var(--color-hover-border-light)]'
          }`}
          >
            {isDarkMode ? (
              <svg
                className="h-6 w-6 text-[var(--color-icon-dark)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-[var(--color-icon-light)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* BEFORE FIRST PROMPT */}
        {!firstPromptSubmitted && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h2 className="text-3xl font-semibold mb-8">What can I help with?</h2>

            {/* Center Input Box */}
            <div
              className={`w-full max-w-lg rounded-lg px-4 py-3 flex flex-col ${
                isDarkMode
                  ? 'bg-[var(--color-input-bg-dark)]'
                  : 'bg-[var(--color-input-bg-light)]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon
                  className={`h-5 w-5 ${
                    isDarkMode
                      ? 'text-[var(--color-input-icon-dark)]'
                      : 'text-[var(--color-input-icon-light)]'
                  }`}
                />
                <input
                  className={`flex-1 bg-transparent focus:outline-none ${
                    isDarkMode
                      ? 'text-[var(--color-input-text-dark)] placeholder-[var(--color-input-placeholder-dark)]'
                      : 'text-[var(--color-input-text-light)] placeholder-[var(--color-input-placeholder-light)]'
                  }`}
                  placeholder="Input News Here"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      generateScript();
                    }
                  }}
                />
                <button
                  onClick={generateScript}
                  disabled={isLoading}
                  className="flex items-center justify-center rounded-md px-3 py-2 bg-[var(--color-button-bg)] hover:bg-[var(--color-button-bg-hover)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-spinner-border)] border-t-transparent" />
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5 rotate-90 text-[var(--color-white)]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {isLoading && firstPromptSubmitted && (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-icon)] border-t-transparent" />
          </div>
        )}

        {/* AFTER FIRST PROMPT */}
        {firstPromptSubmitted && !isLoading && (
          <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
            {/* User's Prompt Bubble */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-end"
            >
              <div className="rounded-lg p-4 max-w-[75%] bg-[var(--color-chat-bubble-bg)]">
                <p className="whitespace-pre-wrap text-[var(--color-chat-text)]">
                  {prompt}
                </p>
              </div>
            </motion.div>

            {/* Error Message Bubble */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2 rounded-lg p-4 max-w-[75%] bg-[var(--color-chat-bubble-bg)]">
                  <ExclamationCircleIcon className="h-5 w-5 text-[var(--color-error-icon)] mt-0.5" />
                  <p className="text-[var(--color-error-text)]">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Extracted Content Bubble */}
            {newsContent && (
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2 rounded-lg p-4 max-w-[75%] bg-[var(--color-chat-bubble-bg)]">
                  <DocumentTextIcon className="h-5 w-5 text-[var(--color-extract-icon)] mt-0.5" />
                  <div>
                    <h2 className="font-medium text-[var(--color-extract-title)]">
                      Extracted Content
                    </h2>
                    <p className="text-[var(--color-chat-text)]">{newsContent}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Analysis Result Bubble */}
            {result && (
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2 rounded-lg p-4 max-w-[75%] bg-[var(--color-chat-bubble-bg)]">
                  <CheckCircleIcon className="h-5 w-5 text-[var(--color-result-icon)] mt-0.5" />
                  <div>
                    <h2 className="font-medium text-[var(--color-result-title)]">
                      Analysis Result
                    </h2>
                    <p className="text-[var(--color-chat-text)]">
                      {typeof result === 'string'
                        ? result
                        : JSON.stringify(result)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* BOTTOM INPUT */}
      {firstPromptSubmitted && (
        <div className="border-t border-[var(--color-border)] p-3">
          <div className="mx-auto w-full max-w-3xl flex items-center space-x-2 bg-[var(--color-chat-bubble-bg)] rounded-md px-3 py-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateScript();
                }
              }}
              rows={1}
              placeholder="Input News Here"
              className="flex-1 resize-none bg-transparent focus:outline-none text-[var(--color-input-text-dark)] placeholder-[var(--color-input-placeholder-dark)]"
            />
            <button
              onClick={generateScript}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-[var(--color-button-bg)] hover:bg-[var(--color-button-bg-hover)] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-spinner-border)] border-t-transparent" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5 rotate-90 text-[var(--color-white)]" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {/* <footer className="w-full max-w-full sm:max-w-4xl lg:max-w-6xl text-center mt-2 sm:mt-6 text-gray-400 text-xs sm:text-sm space-y-1 px-14">
        <p>© {new Date().getFullYear()} All rights reserved. Developed by <b>Tendulkar Budida</b></p>
        <div className="flex justify-center gap-4">
          <a href="https://github.com/TendulkarBudida" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-200 underline">
            <FaGithub className="text-base sm:text-lg" /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/tendulkarbudida/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-200 underline">
            <FaLinkedin className="text-base sm:text-lg" /> LinkedIn
          </a>
        </div>
      </footer> */}
      <footer className="flex items-center justify-center py-2 text-sm bg-[var(--color-footer-bg)] text-[var(--color-footer-text)]">
        <p>Developed by Team Name | © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}