import { PRODUCT_IMAGES_BUCKET, supabaseAdmin } from './config/supabase.js'

async function testStorage() {
  const { data, error } = await supabaseAdmin
    .storage
    .from(PRODUCT_IMAGES_BUCKET)
    .list('', {
      limit: 10,
    })

  if (error) {
    console.error('Storage test failed:')
    console.error(error)
    process.exit(1)
  }

  console.log('Storage connection successful.')
  console.log('Files:', data)
}

testStorage()