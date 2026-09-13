import fs from 'fs'
import path from 'path'
import pg from 'pg'

const { Client } = pg

const projectRef = process.env.SUPABASE_PROJECT_REF
const dbPassword = process.env.DB_PASSWORD || process.argv[2]
const region = process.env.SUPABASE_DB_REGION || 'aws-0-ap-northeast-1'

if (!projectRef || !dbPassword) {
  console.log('Thiếu SUPABASE_PROJECT_REF hoặc DB_PASSWORD cho Công ty 23.')
  process.exit(0)
}

const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@${region}.pooler.supabase.com:6543/postgres`

async function run() {
  console.log(`Đang kết nối tới Supabase (${projectRef} tại ${region})...`)
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('✓ Kết nối Database thành công!')

    console.log('Đang thực thi 01_schema_company_23.sql...')
    const schemaSql = fs.readFileSync(path.resolve('supabase/01_schema_company_23.sql'), 'utf8')
    await client.query(schemaSql)
    console.log('✓ Tạo các bảng: companies, nhan_su, cham_cong, bang_cong_thang thành công!')

    console.log('Đang thực thi 02_seed_demo_23.sql...')
    const seedSql = fs.readFileSync(path.resolve('supabase/02_seed_demo_23.sql'), 'utf8')
    await client.query(seedSql)
    console.log('✓ Nạp dữ liệu giả lập 8 nhân viên và ma trận chấm công tháng 2026-08 thành công!')

    console.log('\n======================================================')
    console.log('>>> TOÀN BỘ CSDL SUPABASE 23 ĐÃ ĐƯỢC TẠO VÀ SEED XONG! <<<')
    console.log('======================================================\n')
  } catch (err) {
    console.error('Lỗi thực thi migration:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
