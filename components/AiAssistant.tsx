import React, { useMemo, useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ProjectState } from '../types';
import { askProjectAssistant } from '../services/geminiService';

interface AiAssistantProps {
  project: ProjectState;
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
  const [isLoading, setIsLoading] = useState(false);

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
      if (!overrideQuestion) setQuestion('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h3 className="text-lg font-bold text-slate-900">AI Project Assistant</h3>
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

      <div className="prose max-w-none prose-sm bg-slate-50 border border-slate-200 rounded-xl p-4">
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>
    </div>
  );
};

export default AiAssistant;
