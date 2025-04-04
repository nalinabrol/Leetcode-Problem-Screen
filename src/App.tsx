import React, { useState, useEffect } from 'react';
import { Code2, Play, Send, Terminal, CheckCircle2, XCircle, Timer } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';

type Tab = 'input' | 'output' | 'verdict';
type Language = 'python' | 'javascript' | 'typescript' | 'java';

const getLanguageExtension = (language: Language) => {
  switch (language) {
    case 'python':
      return python();
    case 'javascript':
    case 'typescript':
      return javascript();
    case 'java':
      return java();
    default:
      return python();
  }
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

function App() {
  const [selectedTab, setSelectedTab] = useState<Tab>('input');
  const [language, setLanguage] = useState<Language>('python');
  const [input, setInput] = useState('');
  const [code, setCode] = useState('# Write your code here\n');
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState<{passed: number, total: number} | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRun = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          input,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput(`Executing ${language} code with input:\n${input}\n\nOutput:\n${data.output}`);
      }
      setSelectedTab('output');
    } catch (error) {
      setOutput(`Error: Failed to connect to the server. Please make sure the backend is running.`);
      setSelectedTab('output');
    }
  };

  const handleSubmit = () => {
    setVerdict({ passed: 8, total: 10 });
    setSelectedTab('verdict');
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Timer Bar */}
      <div className="bg-gray-800 p-2 flex items-center justify-end pr-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4" />
          <span className="font-mono">{formatTime(timer)}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Problem Statement */}
        <div className="w-2/5 overflow-y-auto p-6 border-r border-gray-700">
          <h1 className="text-2xl font-bold mb-4">Two Sum</h1>
          <div className="prose prose-invert">
            <p className="text-gray-300">
              Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
              You may assume that each input would have exactly one solution, and you may not use the same element twice.
            </p>
            <h2 className="text-xl font-semibold mt-4 mb-2">Example:</h2>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
              Input: nums = [2,7,11,15], target = 9{'\n'}
              Output: [0,1]{'\n'}
              Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
            </pre>
          </div>
        </div>

        {/* Code Editor and Output Section */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              <span>Code Editor</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeMirror
              value={code}
              height="100%"
              theme={vscodeDark}
              extensions={[getLanguageExtension(language)]}
              onChange={(value) => setCode(value)}
              className="h-full"
            />
          </div>

          {/* Bottom Panel */}
          <div className="border-t border-gray-700">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setSelectedTab('input')}
                className={`px-4 py-2 ${selectedTab === 'input' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                <Terminal className="w-4 h-4 inline mr-2" />
                Input
              </button>
              <button
                onClick={() => setSelectedTab('output')}
                className={`px-4 py-2 ${selectedTab === 'output' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                <Terminal className="w-4 h-4 inline mr-2" />
                Output
              </button>
              <button
                onClick={() => setSelectedTab('verdict')}
                className={`px-4 py-2 ${selectedTab === 'verdict' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Verdict
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 bg-gray-800 h-48">
              {selectedTab === 'input' && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your test input here..."
                  className="w-full h-full bg-gray-900 text-white font-mono p-2 rounded resize-none focus:outline-none"
                />
              )}
              {selectedTab === 'output' && (
                <pre className="font-mono text-sm whitespace-pre-wrap h-full overflow-auto">{output}</pre>
              )}
              {selectedTab === 'verdict' && verdict && (
                <div className="flex flex-col items-center justify-center h-full">
                  {verdict.passed === verdict.total ? (
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-500 mb-2" />
                  )}
                  <p className="text-lg">
                    {verdict.passed} / {verdict.total} test cases passed
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex justify-end gap-4">
              <button
                onClick={handleRun}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;