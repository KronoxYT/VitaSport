import React, { useEffect, useState } from 'react'
import { get } from '../api'

export default function Usuarios(){
  const [usuarios, setUsuarios] = useState([])
  useEffect(()=>{ async function load(){ try{ const r = await get('/api/usuarios'); setUsuarios(r.success?r.usuarios:[]) }catch(e){ setUsuarios([])} } load() },[])
  return (
    <div className="container mt-4">
      <h3>Usuarios</h3>
      <table className="table"><thead><tr><th>ID</th><th>Usuario</th><th>Role</th></tr></thead>
      <tbody>{usuarios.map(u=>(<tr key={u.id}><td>{u.id}</td><td>{u.username}</td><td>{u.role}</td></tr>))}</tbody></table>
    </div>
  )
}
