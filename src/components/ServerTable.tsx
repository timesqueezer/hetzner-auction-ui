import React from "react"
import { useReactTable, flexRender, createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material"
import HetznerServer from "../types/HetznerServer"

type ServerTableProps = {
  servers: HetznerServer[]
}

function getCellInfo(info: any) {
  const values = info.getValue() as number[];
  if (values.length === 0) {
    return ''
  }
  const countGroups: Record<number, number> = {}
  values.forEach(value => {
    countGroups[value] = (countGroups[value] || 0) + 1
  })
  let ret = ''
  for (const [value, count] of Object.entries(countGroups)) {
    ret += Number(value) >= 1000
      ? `${count}x ${Number(value) / 1000}TB `
      : `${count}x ${value}GB `
  }
  return ret.trim()
}

const columnHelper = createColumnHelper<HetznerServer>()

const defaultColumns = [
  columnHelper.group({
    id: 'Server Data',
    header: () => <span>Server Data</span>,
    columns: [
      columnHelper.accessor('cpu', {
        header: 'CPU',
        cell: info => info.getValue(),
        footer: props => props.column.id,
      }),
      columnHelper.accessor('ram_size', {
        header: 'RAM (GB)',
        cell: info => info.getValue() + 'GB',
        footer: props => props.column.id,
      }),
      columnHelper.accessor('price', {
        header: 'Price (€)',
        cell: info => info.getValue() + '€',
        footer: props => props.column.id,
      }),
      columnHelper.accessor('datacenter', {
        header: 'Datacenter',
        cell: info => info.getValue(),
        footer: props => props.column.id,
      }),
    ],
  }),
  columnHelper.group({
    id: 'Server Disk Data',
    header: () => <span>Server Disk Data</span>,
    columns: [
      columnHelper.accessor('serverDiskData.nvme', {
        header: 'NVMe',
        cell: info => getCellInfo(info),
      }),
      columnHelper.accessor('serverDiskData.sata', {
        header: 'SATA',
        cell: info => getCellInfo(info),
      }),
      columnHelper.accessor('serverDiskData.hdd', {
        header: 'HDD',
        cell: info => getCellInfo(info),
      }),
    ],
  })
]

const ServerTable: React.FC<ServerTableProps> = ({ servers }) => {
  const data = React.useMemo(() => servers, [servers])

  const table = useReactTable({
    data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Paper>
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 25rem)' }}>
        <Table stickyHeader aria-label="Hetzner Auction Table">
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default ServerTable
