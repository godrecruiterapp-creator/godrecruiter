import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const POOL_MIN_SIZE = 5
const POOL_SCHEMA_PREFIX = 'pool_'

Deno.serve(async (req) => {
  // Validate this is called from our cron or internally — not public
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  // Count available pool schemas
  const { count, error: countError } = await supabase
    .from('pool_schemas')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true)

  if (countError) {
    console.error('Pool count error:', countError)
    return new Response(JSON.stringify({ error: countError.message }), { status: 500 })
  }

  const available = count ?? 0
  const needed = Math.max(0, POOL_MIN_SIZE - available)

  if (needed === 0) {
    return new Response(JSON.stringify({ message: 'Pool is full', available }), { status: 200 })
  }

  console.log(`Pool has ${available} schemas. Creating ${needed} more.`)

  const created: string[] = []
  const errors: string[] = []

  for (let i = 0; i < needed; i++) {
    try {
      const schemaName = `${POOL_SCHEMA_PREFIX}${generateUlid()}`
      await createTenantSchema(supabase, schemaName)

      const id = generateUlid()
      const { error: insertError } = await supabase
        .from('pool_schemas')
        .insert({ id, schema_name: schemaName, is_available: true })

      if (insertError) throw insertError

      created.push(schemaName)
      console.log(`Created pool schema: ${schemaName}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(msg)
      console.error(`Failed to create pool schema:`, msg)
    }
  }

  return new Response(
    JSON.stringify({ created, errors, available: available + created.length }),
    { status: errors.length > 0 ? 207 : 200 }
  )
})

async function createTenantSchema(
  supabase: ReturnType<typeof createClient>,
  schemaName: string
): Promise<void> {
  // Read the tenant schema template SQL
  const templateSql = await Deno.readTextFile('./tenant_schema_template.sql')

  // Replace placeholder with actual schema name
  const sql = templateSql.replaceAll(':tenant_schema', schemaName)

  // Execute via rpc — requires a helper function in public schema
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) throw error
}

// Simple ULID generation (time-sortable, collision-resistant)
function generateUlid(): string {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  const now = Date.now()
  let result = ''

  // 10 time chars
  let t = now
  for (let i = 9; i >= 0; i--) {
    result = (chars[t % 32] ?? '0') + result
    t = Math.floor(t / 32)
  }

  // 16 random chars
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * 32)] ?? '0'
  }

  return result
}
