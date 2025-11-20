interface OpenAiGlobals {
  toolInput?: Record<string, unknown>;
  toolOutput?: unknown;
  toolResponseMetadata?: Record<string, unknown>;
  theme?: "light" | "dark";
  displayMode?: "inline" | "fullscreen" | "pip";
  locale?: string;
  userLocation?: Record<string, unknown>;
}
interface SetGlobalsEvent extends CustomEvent {
  detail: { globals: Partial<OpenAiGlobals>; };
}
declare global {
  interface Window {
    openai?: OpenAiGlobals & {
      requestDisplayMode?: (options: { mode: "fullscreen" | "pip" }) => Promise<void>;
      callTool?: (toolName: string, args: Record<string, unknown>) => Promise<unknown>;
    };
  }
}
import { useEffect, useState } from 'react';

function useOpenAiGlobal<K extends keyof OpenAiGlobals>(key: K): OpenAiGlobals[K] | undefined {
  const [value, setValue] = useState<OpenAiGlobals[K]>();
  useEffect(() => {
    if (window.openai?.[key]) { setValue(window.openai[key]); }
    const handler = (event: Event) => {
      const customEvent = event as SetGlobalsEvent;
      if (key in customEvent.detail.globals) { setValue(customEvent.detail.globals[key]); }
    };
    window.addEventListener("openai:set_globals", handler);
    return () => window.removeEventListener("openai:set_globals", handler);
  }, [key]);
  return value;
}

function useTheme() { return useOpenAiGlobal("theme"); }
function useDisplayMode() { return useOpenAiGlobal("displayMode"); }

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  const theme = useTheme();
  const displayMode = useDisplayMode();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (theme === 'dark') { document.documentElement.classList.add('dark'); }
    else { document.documentElement.classList.remove('dark'); }
  }, [theme]);

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const requestFullscreen = () => { 
    window.openai?.requestDisplayMode?.({ mode: "fullscreen" }); 
  };

  const darkMode = theme === "dark";

  return (
    <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📝 Todo List</h1>
          {displayMode !== "fullscreen" && (
            <button 
              onClick={requestFullscreen} 
              className={`px-3 py-1 rounded text-sm transition ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white`}
            >
              Expand
            </button>
          )}
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new todo..."
              className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
            />
            <button
              onClick={addTodo}
              className={`px-6 py-2 rounded-lg font-medium transition ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white`}
            >
              Add
            </button>
          </div>
        </div>

        <div className={`rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          {todos.length === 0 ? (
            <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No todos yet. Add one to get started!
            </div>
          ) : (
            <ul className="divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}">
              {todos.map((todo) => (
                <li key={todo.id} className={`p-4 flex items-center gap-3 transition ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className={`flex-1 ${todo.completed ? "line-through opacity-50" : ""}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className={`px-3 py-1 rounded text-sm transition ${darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} text-white`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`mt-4 text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {todos.filter(t => !t.completed).length} of {todos.length} tasks remaining
        </div>
      </div>
    </div>
  );
}

export default App;