function requiredServer(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required server environment variable: ${name}`)
  return value
}

export const contentEngineEnv = {
  supabaseUrl: () => requiredServer('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseServiceRoleKey: () => requiredServer('SUPABASE_SERVICE_ROLE_KEY'),
  githubToken: () => process.env.GITHUB_TOKEN,
  stackExchangeApiKey: () => process.env.STACK_EXCHANGE_API_KEY,
  aiProvider: () => process.env.CONTENT_AI_PROVIDER ?? 'none',
  aiApiKey: () => process.env.CONTENT_AI_API_KEY,
}
