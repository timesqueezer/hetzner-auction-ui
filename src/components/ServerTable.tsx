import React, { useMemo, useCallback } from "react";
import {
  useReactTable,
  flexRender,
  createColumnHelper,
  getCoreRowModel,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import { TableVirtuoso, TableComponents } from "react-virtuoso";

import HetznerServer from "../types/HetznerServer";

type ServerTableProps = {
  servers: HetznerServer[];
};

function getCellInfo(info: any) {
  const values = info.getValue() as number[];
  if (values.length === 0) {
    return "";
  }
  const countGroups: Record<number, number> = {};
  values.forEach((value) => {
    countGroups[value] = (countGroups[value] || 0) + 1;
  });
  let ret = "";
  for (const [value, count] of Object.entries(countGroups)) {
    ret +=
      Number(value) >= 1000
        ? `${count}x ${Number(value) / 1000}TB `
        : `${count}x ${value}GB `;
  }
  return ret.trim();
}

const columnHelper = createColumnHelper<HetznerServer>();

// Move columns definition outside component to prevent recreation
const columns = [
  columnHelper.group({
    id: "Server Data",
    header: () => <span>Server Data</span>,
    columns: [
      columnHelper.accessor("cpu", {
        header: "CPU",
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
      }),
      columnHelper.accessor("ram_size", {
        header: "RAM (GB)",
        cell: (info) => info.getValue() + "GB",
        footer: (props) => props.column.id,
      }),
      columnHelper.accessor("price", {
        header: "Price (€)",
        cell: (info) => info.getValue() + "€",
        footer: (props) => props.column.id,
      }),
      columnHelper.accessor("datacenter", {
        header: "Datacenter",
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
      }),
    ],
  }),
  columnHelper.group({
    id: "Server Disk Data",
    header: () => <span>Server Disk Data</span>,
    columns: [
      columnHelper.accessor("serverDiskData.nvme", {
        header: "NVMe",
        cell: (info) => getCellInfo(info),
      }),
      columnHelper.accessor("serverDiskData.sata", {
        header: "SATA",
        cell: (info) => getCellInfo(info),
      }),
      columnHelper.accessor("serverDiskData.hdd", {
        header: "HDD",
        cell: (info) => getCellInfo(info),
      }),
    ],
  }),
];

const VirtuosoTableComponents: TableComponents<Row<HetznerServer>> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      stickyHeader
      sx={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

const ServerTable: React.FC<ServerTableProps> = ({ servers }) => {
  const data = useMemo(() => servers, [servers]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const fixedHeaderContent = useMemo(() => {
    return () => (
      <>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableCell 
                key={header.id} 
                colSpan={header.colSpan}
                sx={{ 
                  backgroundColor: 'background.paper',
                  borderBottom: 2,
                  borderColor: 'divider'
                }}
              >
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
      </>
    )
  }, [table]);

  const rowContent = useCallback((_index: number, row: Row<HetznerServer>) => {
    return (
      <React.Fragment>
        {row.getVisibleCells().map((cell) => (
          <TableCell 
            key={cell.id}
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </React.Fragment>
    );
  }, []);

  return (
    <Paper sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <TableVirtuoso
        data={table.getRowModel().rows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
        style={{ flex: 1 }}
      />
    </Paper>
  );
};

export default React.memo(ServerTable);
