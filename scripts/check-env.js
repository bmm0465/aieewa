// 환경 변수 확인 스크립트
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

console.log('🔍 환경 변수 확인 중...\n')

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY', 
  'OPENAI_API_KEY'
]

let allSet = true

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  if (value) {
    console.log(`✅ ${envVar}: 설정됨 (${value.substring(0, 20)}...)`)
  } else {
    console.log(`❌ ${envVar}: 설정되지 않음`)
    allSet = false
  }
})

console.log('\n' + '='.repeat(50))

if (allSet) {
  console.log('🎉 모든 환경 변수가 설정되었습니다!')
  console.log('💡 이제 "npm run seed-pdfs" 명령어를 실행할 수 있습니다.')
} else {
  console.log('⚠️  일부 환경 변수가 설정되지 않았습니다.')
  console.log('📋 .env.local 파일을 확인하고 다음 변수들을 설정해주세요:')
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.log(`   - ${envVar}`)
    }
  })
  console.log('\n💡 Supabase 대시보드 → Settings → API에서 값을 확인할 수 있습니다.')
}
