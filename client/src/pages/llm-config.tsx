import { LlmConfigForm } from "@/components/forms/llm-config-form";
import { useAuth } from "@/hooks/use-auth";
import { USER_ROLES } from "@/lib/constants";
import { AlertTriangle } from "lucide-react";

export default function LlmConfig() {
  const { user } = useAuth();

  if (user?.role !== USER_ROLES.DELIVERY_MANAGER && user?.role !== USER_ROLES.ADMIN) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">
              You need Delivery Manager or Administrator privileges to access LLM configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LLM Configuration</h1>
            <p className="text-gray-600 mt-1">
              Configure the AI model settings for automated project analysis and insights
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <LlmConfigForm />
        
        {/* Information Section */}
        <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How AI Analysis Works</h3>
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Automated Project Analysis</h4>
              <p>
                When project managers submit weekly status reports, the configured AI model automatically analyzes 
                the project data to provide intelligent insights and risk assessments.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Portfolio-Level Insights</h4>
              <p>
                The AI generates overall portfolio health assessments by analyzing trends across all projects, 
                identifying patterns, and highlighting areas that need attention.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Data Security</h4>
              <p>
                API keys are securely stored and encrypted. Project data is processed according to the 
                privacy policies of the selected AI provider.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Providers */}
        <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported AI Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Google AI</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gemini 2.0 Flash</li>
                <li>• Gemini 1.5 Pro</li>
                <li>• Gemini 1.5 Flash</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">OpenAI</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GPT-4o</li>
                <li>• GPT-4o Mini</li>
                <li>• GPT-4 Turbo</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">DeepSeek</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• DeepSeek Chat</li>
                <li>• DeepSeek Coder</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
