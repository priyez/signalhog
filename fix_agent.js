const fs = require('fs');

// ═══════════════════════════════════════════════════════════════
// 1. Fix AgentSidebar.tsx
// ═══════════════════════════════════════════════════════════════
const sidebarPath = 'apps/web/src/components/AgentSidebar.tsx';
let sidebar = fs.readFileSync(sidebarPath, 'utf-8');

// Add props interface before the function
sidebar = sidebar.replace(
  'export function AgentSidebar() {',
  'export function AgentSidebar({ projectId = "", environmentId = "" }: { projectId?: string; environmentId?: string } = {}) {'
);

// Add projectId/environmentId to fetch body
sidebar = sidebar.replace(
  'body: JSON.stringify({\n          messages: [...messages, newMessage]\n        })',
  'body: JSON.stringify({\n          messages: [...messages, newMessage],\n          projectId,\n          environmentId\n        })'
);

fs.writeFileSync(sidebarPath, sidebar, 'utf-8');
console.log('1. AgentSidebar fixed. Props:', sidebar.includes('projectId = ""') ? 'OK' : 'FAIL');

// ═══════════════════════════════════════════════════════════════
// 2. Fix layout.tsx — add useEnvironment, pass props to AgentSidebar
// ═══════════════════════════════════════════════════════════════
const layoutPath = 'apps/web/src/app/(main)/layout.tsx';
let layout = fs.readFileSync(layoutPath, 'utf-8');

// Add useEnvironment import
if (!layout.includes('useEnvironment')) {
  layout = layout.replace(
    'import { EnvironmentProvider } from "@/contexts/EnvironmentContext";',
    'import { EnvironmentProvider, useEnvironment } from "@/contexts/EnvironmentContext";'
  );
}

// Split into inner component to access context
// Rename the existing function and wrap in a shell
layout = layout.replace(
  'export default function DashboardLayout({',
  'function DashboardShell({'
);

// Add projectId extraction and environmentId from context to the shell function body
layout = layout.replace(
  '  const isLobby = pathname === "/dashboard" || pathname === "/onboarding";',
  '  const isLobby = pathname === "/dashboard" || pathname === "/onboarding";\n  const { environmentId } = useEnvironment();\n  const projectIdMatch = pathname.match(/\\/project\\/([^\\/]+)/);\n  const projectId = projectIdMatch ? projectIdMatch[1] : "";'
);

// Remove inner EnvironmentProvider wrapper (we'll hoist it to the export default)
layout = layout.replace(
  '  return (\n    <EnvironmentProvider>\n      <div className="app-shell">',
  '  return (\n    <div className="app-shell">'
);
layout = layout.replace(
  '      </div>\n    </EnvironmentProvider>\n  );\n}',
  '      </div>\n  );\n}'
);

// Pass props to AgentSidebar
layout = layout.replace(
  '{!isLobby && <AgentSidebar />}',
  '{!isLobby && <AgentSidebar projectId={projectId} environmentId={environmentId} />}'
);

// Add the export default wrapper at the end
if (!layout.includes('export default function DashboardLayout')) {
  layout = layout.trimEnd() + '\n\nexport default function DashboardLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <EnvironmentProvider>\n      <DashboardShell>{children}</DashboardShell>\n    </EnvironmentProvider>\n  );\n}\n';
}

fs.writeFileSync(layoutPath, layout, 'utf-8');
console.log('2. layout.tsx fixed. AgentSidebar props:', layout.includes('projectId={projectId}') ? 'OK' : 'FAIL');

// ═══════════════════════════════════════════════════════════════
// 3. Fix server.ts
// ═══════════════════════════════════════════════════════════════
const serverPath = 'apps/api/src/server.ts';
let server = fs.readFileSync(serverPath, 'utf-8');

// Fix body destructuring
server = server.replace(
  'const { messages } = request.body as { messages: any[] };',
  'const { messages, projectId: ctxProjectId, environmentId: ctxEnvironmentId } = request.body as { messages: any[]; projectId?: string; environmentId?: string };'
);

// Inject context into system prompt (avoid nested template literals by building string differently)
const oldPrompt = 'When users ask about stats or flags, use the provided tools. \n            NEVER guess or hallucinate IDs. If you need a flag ID, ask the user or list the flags first.\n            To enable/disable a flag, ALWAYS use toggle_flag_by_key unless you have a VERIFIED flagId.';
const newPrompt = 'When users ask about stats or flags, use the provided tools.\n            CURRENT CONTEXT: projectId="' + '" + (ctxProjectId||"unknown") + "' + '", environmentId="' + '" + (ctxEnvironmentId||"unknown") + ".\n            ALWAYS use these exact IDs from CURRENT CONTEXT when calling tools - never invent IDs.\n            NEVER guess or hallucinate IDs. If you need a flag ID, ask the user or list the flags first.\n            To enable/disable a flag, ALWAYS use toggle_flag_by_key unless you have a VERIFIED flagId.';

// Actually, let's just use string concatenation for the system content
const oldContent = '            content: `You are SignalHog AI. You can help users manage flags and analyze data. \n            When users ask about stats or flags, use the provided tools. \n            NEVER guess or hallucinate IDs. If you need a flag ID, ask the user or list the flags first.\n            To enable/disable a flag, ALWAYS use toggle_flag_by_key unless you have a VERIFIED flagId.`';
const newContent = '            content: `You are SignalHog AI. You can help users manage flags and analyze data.\\n            When users ask about stats or flags, use the provided tools.\\n            CURRENT CONTEXT: projectId="${ctxProjectId || \'unknown\'}", environmentId="${ctxEnvironmentId || \'unknown\'}".\\n            ALWAYS use these exact IDs when calling tools - never invent or guess IDs.\\n            NEVER guess or hallucinate IDs. If you need a flag ID, list flags first.\\n            To enable/disable a flag, ALWAYS use toggle_flag_by_key unless you have a VERIFIED flagId.`';

if (server.includes(oldContent)) {
  server = server.replace(oldContent, newContent);
  console.log('3a. System prompt updated.');
} else {
  console.log('3a. WARNING: Could not find old system prompt content.');
}

// Add validation before flag create
const oldCreate = '          create_flag: async (args: { projectId: string; environmentId: string; key: string; name?: string; enabled?: boolean }) => {\n            const flag = await prisma.flag.create({';
const newCreate = '          create_flag: async (args: { projectId: string; environmentId: string; key: string; name?: string; enabled?: boolean }) => {\n            const project = await prisma.project.findUnique({ where: { id: args.projectId } });\n            if (!project) return { error: "Project ID \'" + args.projectId + "\' not found. Check the CURRENT CONTEXT for the correct projectId." };\n            const env = await prisma.environment.findUnique({ where: { id: args.environmentId } });\n            if (!env) return { error: "Environment ID \'" + args.environmentId + "\' not found." };\n            const flag = await prisma.flag.create({';

if (server.includes(oldCreate)) {
  server = server.replace(oldCreate, newCreate);
  console.log('3b. create_flag validation added.');
} else {
  console.log('3b. WARNING: Could not find create_flag target.');
}

fs.writeFileSync(serverPath, server, 'utf-8');
console.log('All done!');
