import { NextResponse } from 'next/server'
const res = NextResponse.json({ ok: true })
res.cookies.set('test', 'value')
console.log(res.headers.get('set-cookie'))
