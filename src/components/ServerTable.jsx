import React from "react"
import { useReactTable, useSortBy } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material"

const ServerTable = ({ servers }) => {
  const columns = React.useMemo(
    () => [
      { Header: "CPU", accessor: "cpu" },
      { Header: "RAM (GB)", accessor: "ram_size" },
      { Header: "Storage", accessor: (row) => row.hdd_arr.join(", ") },
      { Header: "Price (€)", accessor: "price" },
    ],
    []
  )

  const data = React.useMemo(() => servers, [servers])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useReactTable(
    { columns, data },
    useSortBy
  )

  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  {...header.getHeaderProps(header.getSortByToggleProps())}
                  style={{ fontWeight: "bold" }}
                >
                  {header.render("Header")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, rowIndex) => {
            prepareRow(row)
            return (
              <TableRow key={`row-${rowIndex}`} {...row.getRowProps()}>
                {row.cells.map((cell, cellIndex) => (
                  <TableCell key={`cell-${rowIndex}-${cellIndex}`} {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ServerTable
