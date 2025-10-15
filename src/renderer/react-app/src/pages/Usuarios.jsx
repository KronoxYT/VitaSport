import React, { useState, useEffect } from 'react'
import { getUsuarios } from '../api'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  useEffect(()=>{ 
    async function load(){ 
      try{ 
        const r = await getUsuarios(); 
        setUsuarios(r.success?r.usuarios:[]) 
      }catch(e){ 
        setUsuarios([])
      } 
    } 
    load() 
  },[])
  return (
    <div className="container mt-4">
      <h2>Usuarios</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
