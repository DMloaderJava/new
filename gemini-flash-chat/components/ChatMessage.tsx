
import React from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { ErrorIcon } from './icons/ErrorIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const isModel = message.role === MessageRole.MODEL;
  const isError = message.role === MessageRole.ERROR;

  const Icon = isUser ? UserIcon : isModel ? BotIcon : ErrorIcon;
  const bgColor = isUser ? 'bg-blue-600' : isModel ? 'bg-slate-700' : 'bg-red-600';
  const textColor = 'text-white'; // Errors also use white text on red background
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleSpecificCorners = isUser ? 'rounded-br-none' : 'rounded-bl-none';

  // Basic Markdown-like formatting for **bold** and *italic* text
  // This is a simplified version, for complex markdown, a library would be better.
  const formatText = (text: string): React.ReactNode => {
    // Split by ``` for code blocks
    const parts = text.split(/(\`\`\`[\s\S]*?\`\`\`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.substring(3, part.length - 3).trim(); // Remove fences and trim
        // Attempt to identify language for syntax highlighting (very basic)
        const langMatch = codeContent.match(/^(\w+)\n/);
        const lang = langMatch ? langMatch[1] : '';
        const actualCode = langMatch ? codeContent.substring(lang.length).trimStart() : codeContent;

        return (
          <pre key={index} className="bg-slate-800 p-3 my-2 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap">
            {lang && <div className="text-xs text-slate-400 mb-1">{lang}</div>}
            <code>{actualCode}</code>
          </pre>
        );
      }
      // Process non-code parts for bold/italic
      return part.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((subPart, subIndex) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return <strong key={subIndex}>{subPart.substring(2, subPart.length - 2)}</strong>;
        }
        if (subPart.startsWith('*') && subPart.endsWith('*')) {
          return <em key={subIndex}>{subPart.substring(1, subPart.length - 1)}</em>;
        }
        if (subPart.startsWith('`') && subPart.endsWith('`')) {
          return <code key={subIndex} className="bg-slate-600 px-1 py-0.5 rounded text-sm font-mono">{subPart.substring(1, subPart.length - 1)}</code>;
        }
        return subPart;
      });
    });
  };


  return (
    <div className={`flex ${alignment} w-full`}>
      <div className={`flex items-start space-x-2 max-w-xl lg:max-w-2xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isUser && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${isModel ? 'bg-teal-500' : 'bg-red-500'} flex items-center justify-center mt-1`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        {isUser && (
           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mt-1">
             <Icon className="w-5 h-5 text-white" />
           </div>
        )}
        <div
          className={`px-4 py-3 rounded-xl ${bubbleSpecificCorners} ${bgColor} ${textColor} shadow-md break-words`}
        >
          <div className="prose prose-sm prose-invert max-w-none">
            {formatText(message.text)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
