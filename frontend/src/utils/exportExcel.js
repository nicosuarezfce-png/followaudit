import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export function exportarPlanesExcel(planes) {
  const filas = planes.flatMap(plan => {
    if (!plan.plazos?.length) {
      return [{
        'Responsable': plan.responsable_nombre,
        'Email': plan.responsable_email,
        'Plan de acción': plan.descripcion,
        'Estado': plan.estado.replace('_', ' '),
        'Plazo #': '—',
        'Fecha vencimiento': '—',
        'Estado plazo': '—',
        'Respuesta auditado': '—',
      }]
    }
    return plan.plazos.map((plazo, idx) => ({
      'Responsable': idx === 0 ? plan.responsable_nombre : '',
      'Email': idx === 0 ? plan.responsable_email : '',
      'Plan de acción': idx === 0 ? plan.descripcion : '',
      'Estado': idx === 0 ? plan.estado.replace('_', ' ') : '',
      'Plazo #': idx + 1,
      'Fecha vencimiento': plazo.fecha_vencimiento,
      'Estado plazo': plazo.estado,
      'Respuesta auditado': plazo.respuesta || '(sin respuesta)',
    }))
  })

  const ws = XLSX.utils.json_to_sheet(filas)

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 22 }, { wch: 28 }, { wch: 50 },
    { wch: 14 }, { wch: 8 }, { wch: 18 }, { wch: 14 }, { wch: 40 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Planes de Acción')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const fecha = new Date().toISOString().slice(0, 10)
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `followaudit_planes_${fecha}.xlsx`)
}
