import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Send, Loader2, Copy, Trash2, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ProjectState } from '../types';
import { askProjectAssistant } from '../services/geminiService';

interface AiAssistantProps {
  project: ProjectState;
}

interface ChatEntry {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

const QUICK_QUESTIONS = [
  'What are the top 3 project risks right now?',
  'Which BOQ items are behind schedule?',
  'Suggest a 7-day action plan for this project.',
  'Summarize financial health in plain language.',
];

const AiAssistant: React.FC<AiAssistantProps> = ({ project }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('Ask a project question to get AI guidance.');
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const storageKey = `ai-assistant-history-${project.id}`;

  useEffect(() => {
    const persisted = localStorage.getItem(storageKey);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as ChatEntry[];
        setHistory(parsed);
      } catch {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 10)));
  }, [history, storageKey]);

  const projectSnapshot = useMemo(() => {
    const delayedBoqItems = project.boq.filter(
      (item) => item.executedQty < item.plannedQty
    ).length;

    return {
      boqItems: project.boq.length,
      delayedBoqItems,
      dprs: project.dprs.length,
      bills: project.bills.length,
      liabilities: project.liabilities.length,

    };
  }, [project]);

  const handleAsk = async (overrideQuestion?: string) => {
    const currentQuestion = (overrideQuestion || question).trim();
    if (!currentQuestion) return;

    setIsLoading(true);
    try {
      const response = await askProjectAssistant(project, currentQuestion);
      setAnswer(response);
      setHistory((prev) => [
        {
          id: `chat-${Date.now()}`,
          question: currentQuestion,
          answer: response,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      if (!overrideQuestion) setQuestion('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnswer = async () => {
    if (!answer.trim()) return;
    await navigator.clipboard.writeText(answer);
  };

  const handleClearHistory = () => {

    setHistory([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-bold text-slate-900">AI Project Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAnswer}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> Copy answer
          </button>
          <button
            onClick={handleClearHistory}
            className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear history
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">

          <p className="text-slate-500">BOQ Items</p>
          <p className="font-bold text-slate-800 text-base">{projectSnapshot.boqItems}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-amber-700">Behind BOQ</p>
          <p className="font-bold text-amber-900 text-base">{projectSnapshot.delayedBoqItems}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-blue-700">DPR Logs</p>
          <p className="font-bold text-blue-900 text-base">{projectSnapshot.dprs}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-emerald-700">Bills</p>
          <p className="font-bold text-emerald-900 text-base">{projectSnapshot.bills}</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
          <p className="text-rose-700">Liabilities</p>
          <p className="font-bold text-rose-900 text-base">{projectSnapshot.liabilities}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((item) => (
            <button
              key={item}

              onClick={() => handleAsk(item)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this project..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !question.trim()}
            className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 prose max-w-none prose-sm bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[240px]">

          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-slate-600" />
            <p className="text-sm font-bold text-slate-800">Recent Q&A</p>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-xs text-slate-500">No Q&A history yet.</p>
            ) : (
              history.slice(0, 10).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setAnswer(entry.answer)}
                  className="w-full text-left p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100"
                >
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">{entry.question}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default AiAssistant;
