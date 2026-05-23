import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma, groq } from '../config';
import { logActivity } from '../utils/logger';

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/ai/chat',
    { preValidation: [(fastify as any).authenticate] },
    async (request: FastifyRequest) => {
      const { messages, projectId: ctxProjectId, environmentId: ctxEnvironmentId } = request.body as { messages: any[]; projectId?: string; environmentId?: string };

      try {
        const tools = [
          {
            type: "function",
            function: {
              name: "get_project_stats",
              description: "Get statistics for a project including total flags, events, and active experiments.",
              parameters: {
                type: "object",
                properties: {
                  projectId: { type: "string" },
                },
                required: ["projectId"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "list_flags",
              description: "List all feature flags for a project and environment.",
              parameters: {
                type: "object",
                properties: {
                  projectId: { type: "string" },
                  environmentId: { type: "string" },
                },
                required: ["projectId", "environmentId"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "toggle_flag",
              description: "Enable or disable a feature flag by its ID. Use toggle_flag_by_key if you only have the key.",
              parameters: {
                type: "object",
                properties: {
                  flagId: { type: "string" },
                  enabled: { type: "boolean", description: "Whether the flag should be enabled" },
                },
                required: ["flagId", "enabled"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "create_flag",
              description: "Create a new feature flag in a project and environment.",
              parameters: {
                type: "object",
                properties: {
                  projectId: { type: "string" },
                  environmentId: { type: "string" },
                  key: { type: "string", description: "The unique key of the flag (lowercase, underscores)" },
                  name: { type: "string", description: "A human-readable name for the flag" },
                  enabled: { type: "boolean" },
                },
                required: ["projectId", "environmentId", "key"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "toggle_flag_by_key",
              description: "Enable or disable a feature flag using its key, project, and environment.",
              parameters: {
                type: "object",
                properties: {
                  projectId: { type: "string" },
                  environmentId: { type: "string" },
                  key: { type: "string" },
                  enabled: { type: "boolean" },
                },
                required: ["projectId", "environmentId", "key", "enabled"],
              },
            },
          }
        ];

        const systemMessage = {
          role: "system",
          content: `You are SignalHog AI, a smart assistant helping developers manage feature flags and analyze project telemetry.

CURRENT CONTEXT: projectId="${ctxProjectId || 'unknown'}", environmentId="${ctxEnvironmentId || 'unknown'}".
ALWAYS use these exact IDs when calling tools - never invent or guess IDs.
NEVER guess or hallucinate IDs. If you need a flag ID, list flags first.
To enable/disable a flag, ALWAYS use toggle_flag_by_key unless you have a VERIFIED flagId.

FORMATTING RULES:
- Use clean, highly readable Markdown formatting.
- Use bullet points to list flags, statistics, steps, or features.
- Use bold text (**bold**) for key terms like project names, flag status (e.g. **Enabled**, **Disabled**).
- Use inline code (\`code\`) for flag keys, environment names, code snippets, or IDs.
- Structure responses with clear headings (### Heading) when explaining multiple concepts.
- Avoid dense, run-on blocks of text. Keep paragraphs short (1-2 sentences max) and use double line breaks to separate ideas.
- Be concise, professional, and action-oriented. Keep preambles to a minimum.`
        };

        const completion = await groq.chat.completions.create({
          messages: [
            systemMessage,
            ...messages.filter((m: any) => m.content != null && m.content !== "")
          ],
          model: "llama-3.1-8b-instant",
          tools: tools as any,
          tool_choice: "auto",
        });

        const responseMessage = completion.choices[0].message;

        if (responseMessage.tool_calls) {
          const toolCalls = responseMessage.tool_calls;
          const availableFunctions: Record<string, Function> = {
            get_project_stats: async (args: { projectId: string }) => {
              const [flags, events, experiments] = await Promise.all([
                prisma.flag.count({ where: { projectId: args.projectId } }),
                (prisma as any).event.count({ where: { projectId: args.projectId } }),
                prisma.experiment.count({ where: { projectId: args.projectId, status: 'RUNNING' } }),
              ]);
              return { flags, events, activeExperiments: experiments };
            },
            list_flags: async (args: { projectId: string; environmentId: string }) => {
              return prisma.flag.findMany({ 
                where: { projectId: args.projectId, environmentId: args.environmentId },
                select: { id: true, key: true, enabled: true }
              });
            },
            toggle_flag: async (args: { flagId: string; enabled: boolean }) => {
              return prisma.flag.update({ where: { id: args.flagId }, data: { enabled: args.enabled } });
            },
            create_flag: async (args: { projectId: string; environmentId: string; key: string; name?: string; enabled?: boolean }) => {
              const project = await prisma.project.findUnique({ where: { id: args.projectId } });
              if (!project) return { error: "Project ID '" + args.projectId + "' not found. Check the CURRENT CONTEXT for the correct projectId." };
              const env = await prisma.environment.findUnique({ where: { id: args.environmentId } });
              if (!env) return { error: "Environment ID '" + args.environmentId + "' not found." };
              const flag = await prisma.flag.create({
                data: {
                  projectId: args.projectId,
                  environmentId: args.environmentId,
                  key: args.key,
                  enabled: args.enabled ?? false,
                }
              });
              const user = (request as any).user as { id: string };
              await logActivity(args.projectId, user.id, 'flag', 'Created', args.key);
              return flag;
            },
            toggle_flag_by_key: async (args: { projectId: string; environmentId: string; key: string; enabled: boolean }) => {
              const flag = await prisma.flag.findFirst({
                where: { projectId: args.projectId, environmentId: args.environmentId, key: args.key }
              });
              
              if (!flag) return { error: `Flag with key '${args.key}' not found in this environment.` };

              const updated = await prisma.flag.update({
                where: { id: flag.id },
                data: { enabled: args.enabled },
              });

              const user = (request as any).user as { id: string };
              await logActivity(args.projectId, user.id, 'flag', args.enabled ? 'Enabled' : 'Disabled', args.key);
              return { success: true, key: args.key, enabled: args.enabled };
            }
          };

          const toolMessages = [
            systemMessage,
            ...messages.filter((m: any) => m.content != null && m.content !== ""),
            responseMessage
          ];

          for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            const functionResponse = await availableFunctions[functionName](functionArgs);

            toolMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: JSON.stringify(functionResponse),
            } as any);
          }

          const secondResponse = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: toolMessages,
          });

          return { content: secondResponse.choices[0].message.content };
        }

        return { content: responseMessage.content || "I couldn't generate a response." };
      } catch (error: any) {
        fastify.log.error(error);
        const errorMessage = error?.message || "I encountered an error while processing your request.";
        return { content: `Error: ${errorMessage}` };
      }
    }
  );
}
