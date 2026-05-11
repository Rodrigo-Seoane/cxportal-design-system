import type { Meta, StoryObj } from '@storybook/react'
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableCaption,
  TableCheckboxHead, TableCheckboxCell,
} from './table'

const meta: Meta = {
  title: 'UI/Table',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

const ROWS = [
  { name: 'Alice Johnson', role: 'Designer', status: 'Active', joined: '2023-01-15' },
  { name: 'Bob Smith', role: 'Engineer', status: 'Active', joined: '2022-09-01' },
  { name: 'Carol White', role: 'PM', status: 'Inactive', joined: '2021-06-20' },
  { name: 'Dave Brown', role: 'Engineer', status: 'Active', joined: '2024-03-10' },
]

export const Wide: Story = {
  render: () => (
    <Table size="wide">
      <TableHeader>
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell variant="secondary">{row.role}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell variant="secondary">{row.joined}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Compact: Story = {
  render: () => (
    <Table size="compact">
      <TableHeader>
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell variant="secondary">{row.role}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell variant="secondary">{row.joined}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Striped: Story = {
  render: () => (
    <Table size="wide">
      <TableHeader>
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {ROWS.map((row, i) => (
          <TableRow key={row.name} striped={i % 2 === 1}>
            <TableCell>{row.name}</TableCell>
            <TableCell variant="secondary">{row.role}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Sortable: Story = {
  render: () => (
    <Table size="wide">
      <TableHeader>
        <tr>
          <TableHead sortDirection="asc" onSort={() => {}}>Name</TableHead>
          <TableHead sortDirection="none" onSort={() => {}}>Role</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell variant="secondary">{row.role}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Selectable: Story = {
  render: () => (
    <Table size="wide">
      <TableHeader>
        <tr>
          <TableCheckboxHead />
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.name}>
            <TableCheckboxCell />
            <TableCell>{row.name}</TableCell>
            <TableCell variant="secondary">{row.role}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableCaption>Team members as of 2024</TableCaption>
    </Table>
  ),
}

export const WithDisabledRow: Story = {
  render: () => (
    <Table size="wide">
      <TableHeader>
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice Johnson</TableCell>
          <TableCell variant="secondary">Designer</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow disabled>
          <TableCell>Carol White</TableCell>
          <TableCell variant="secondary">PM</TableCell>
          <TableCell>Inactive</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
