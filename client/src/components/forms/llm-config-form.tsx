import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertLlmConfigurationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LLM_PROVIDERS, MODEL_OPTIONS } from "@/lib/constants";
import type { LlmConfiguration } from "@shared/schema";

const llmConfigFormSchema = insertLlmConfigurationSchema;

type LlmConfigFormData = z.infer<typeof llmConfigFormSchema>;

export function LlmConfigForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentConfig, isLoading } = useQuery<LlmConfiguration>({
    queryKey: ['/api/llm-config'],
  });

  const form = useForm<LlmConfigFormData>({
    resolver: zodResolver(llmConfigFormSchema),
    defaultValues: {
      providerName: LLM_PROVIDERS.GOOGLE,
      modelName: "gemini-2.0-flash",
      apiKey: "",
      isActive: true,
    },
    values: currentConfig ? {
      providerName: currentConfig.providerName,
      modelName: currentConfig.modelName,
      apiKey: currentConfig.apiKey,
      isActive: currentConfig.isActive,
    } : undefined,
  });

  const selectedProvider = form.watch("providerName");

  const createConfigMutation = useMutation({
    mutationFn: async (data: LlmConfigFormData) => {
      return apiRequest('POST', '/api/llm-config', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "LLM configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/llm-config'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update LLM configuration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LlmConfigFormData) => {
    createConfigMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LLM Configuration</CardTitle>
          <CardDescription>Loading current configuration...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Configuration</CardTitle>
        <CardDescription>
          Configure the Large Language Model provider and settings for automated project analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="providerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LLM Provider</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select LLM Provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={LLM_PROVIDERS.GOOGLE}>Google</SelectItem>
                      <SelectItem value={LLM_PROVIDERS.OPENAI}>OpenAI</SelectItem>
                      <SelectItem value={LLM_PROVIDERS.DEEPSEEK}>DeepSeek</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Name</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MODEL_OPTIONS[selectedProvider as keyof typeof MODEL_OPTIONS]?.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your API key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="submit" 
                disabled={createConfigMutation.isPending}
              >
                {createConfigMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </Form>

        {currentConfig && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Current Configuration</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Provider:</strong> {currentConfig.providerName}</p>
              <p><strong>Model:</strong> {currentConfig.modelName}</p>
              <p><strong>Status:</strong> {currentConfig.isActive ? "Active" : "Inactive"}</p>
              <p><strong>Last Updated:</strong> {new Date(currentConfig.lastUpdatedDate!).toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
